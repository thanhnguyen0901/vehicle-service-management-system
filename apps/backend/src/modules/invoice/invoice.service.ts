import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus, Prisma, WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto, CreatePaymentDto, InvoiceQueryDto } from './dto/invoice.dto';

const invoiceSelect = {
  id: true,
  workOrderId: true,
  status: true,
  totalAmount: true,
  discount: true,
  tax: true,
  notes: true,
  issuedAt: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
  workOrder: {
    select: {
      id: true,
      status: true,
      receivedAt: true,
      vehicle: {
        select: {
          id: true,
          licensePlate: true,
          make: true,
          model: true,
          customer: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              type: true,
              companyName: true,
              taxCode: true,
              address: true,
            },
          },
        },
      },
    },
  },
  lines: {
    select: {
      id: true,
      description: true,
      quantity: true,
      unitPrice: true,
      amount: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  },
  payments: {
    select: {
      id: true,
      amount: true,
      method: true,
      transactionRef: true,
      paidAt: true,
      receivedBy: true,
      createdAt: true,
    },
    orderBy: { paidAt: 'asc' },
  },
} satisfies Prisma.InvoiceSelect;

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: InvoiceQueryDto = {}) {
    const keyword = query.search?.trim();
    return this.prisma.invoice.findMany({
      where: {
        status: query.status,
        issuedAt:
          query.from || query.to
            ? {
                gte: query.from,
                lte: query.to,
              }
            : undefined,
        ...(keyword
          ? {
              OR: [
                {
                  workOrder: {
                    vehicle: {
                      OR: [
                        { licensePlate: { contains: keyword, mode: 'insensitive' } },
                        {
                          customer: {
                            OR: [
                              { fullName: { contains: keyword, mode: 'insensitive' } },
                              { phone: { contains: keyword, mode: 'insensitive' } },
                              { companyName: { contains: keyword, mode: 'insensitive' } },
                            ],
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            }
          : {}),
      },
      select: invoiceSelect,
      orderBy: { issuedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      select: invoiceSelect,
    });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }

  async create(dto: CreateInvoiceDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const workOrder = await tx.workOrder.findUnique({
          where: { id: dto.workOrderId },
          select: {
            id: true,
            status: true,
            invoice: { select: { id: true } },
            items: {
              select: {
                description: true,
                quantity: true,
                unitPrice: true,
                amount: true,
                partUsages: {
                  select: {
                    quantity: true,
                    unitPrice: true,
                    part: {
                      select: {
                        partNumber: true,
                        name: true,
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        });

        if (!workOrder) throw new NotFoundException(`Work order ${dto.workOrderId} not found`);
        if (workOrder.invoice) throw new ConflictException('Work order already has an invoice');
        if (workOrder.status !== WorkOrderStatus.ReadyForDelivery) {
          throw new BadRequestException('Work order must be ReadyForDelivery before invoicing');
        }

        const lines = workOrder.items.flatMap((item) => [
          {
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
          },
          ...item.partUsages.map((usage) => ({
            description: `${usage.part.partNumber} - ${usage.part.name}`,
            quantity: usage.quantity,
            unitPrice: usage.unitPrice,
            amount: usage.unitPrice.mul(usage.quantity),
          })),
        ]);

        if (lines.length === 0) {
          throw new BadRequestException('Work order has no billable items');
        }

        const subtotal = lines.reduce(
          (sum, line) => sum.add(line.amount),
          new Prisma.Decimal(0),
        );
        const discount = new Prisma.Decimal(dto.discount);
        const tax = new Prisma.Decimal(dto.tax);
        const totalAmount = subtotal.sub(discount).add(tax);
        if (totalAmount.isNegative()) {
          throw new BadRequestException('Discount cannot exceed subtotal plus tax');
        }

        return tx.invoice.create({
          data: {
            workOrderId: workOrder.id,
            totalAmount,
            discount,
            tax,
            notes: dto.notes || null,
            lines: {
              create: lines.map((line) => ({
                description: line.description,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                amount: line.amount,
              })),
            },
          },
          select: invoiceSelect,
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Work order already has an invoice');
      }
      throw error;
    }
  }

  async createPayment(invoiceId: string, dto: CreatePaymentDto, receivedBy: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const invoice = await tx.invoice.findUnique({
          where: { id: invoiceId },
          select: {
            id: true,
            status: true,
            totalAmount: true,
            payments: { select: { amount: true } },
          },
        });
        if (!invoice) throw new NotFoundException(`Invoice ${invoiceId} not found`);
        if (invoice.status === InvoiceStatus.Paid) {
          throw new ConflictException('Invoice is already paid');
        }

        const paidAmount = invoice.payments.reduce(
          (sum, payment) => sum.add(payment.amount),
          new Prisma.Decimal(0),
        );
        const amount = new Prisma.Decimal(dto.amount);
        const remaining = invoice.totalAmount.sub(paidAmount);
        if (amount.gt(remaining)) {
          throw new BadRequestException(`Payment exceeds remaining amount ${remaining.toString()}`);
        }

        const payment = await tx.payment.create({
          data: {
            invoiceId,
            amount,
            method: dto.method,
            transactionRef: dto.transactionRef || null,
            receivedBy,
          },
        });

        const nextPaidAmount = paidAmount.add(amount);
        const isPaid = nextPaidAmount.eq(invoice.totalAmount);
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            status: isPaid ? InvoiceStatus.Paid : InvoiceStatus.Unpaid,
            paidAt: isPaid ? payment.paidAt : null,
          },
        });

        return this.findByIdWithClient(tx, invoiceId);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  private async findByIdWithClient(tx: Prisma.TransactionClient, id: string) {
    const invoice = await tx.invoice.findUnique({
      where: { id },
      select: invoiceSelect,
    });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }
}
