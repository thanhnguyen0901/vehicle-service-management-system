import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, Prisma, TransactionType, WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateWorkOrderDto,
  CreateWorkOrderItemDto,
  CreatePartUsageDto,
  UpdatePartUsageDto,
  UpdateWorkOrderItemDto,
  UpdateWorkOrderStatusDto,
  WorkOrderQueryDto,
} from './dto/work-order.dto';

const workOrderSelect = {
  id: true,
  vehicleId: true,
  appointmentId: true,
  status: true,
  diagnosis: true,
  technicianId: true,
  advisorId: true,
  receivedAt: true,
  deliveredAt: true,
  createdAt: true,
  updatedAt: true,
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
        },
      },
    },
  },
  appointment: {
    select: {
      id: true,
      scheduledAt: true,
      status: true,
      serviceNote: true,
    },
  },
  items: {
    select: {
      id: true,
      serviceId: true,
      description: true,
      quantity: true,
      unitPrice: true,
      amount: true,
      createdAt: true,
      updatedAt: true,
      service: {
        select: {
          id: true,
          name: true,
        },
      },
      partUsages: {
        select: {
          id: true,
          partId: true,
          quantity: true,
          unitPrice: true,
          createdAt: true,
          part: {
            select: {
              id: true,
              partNumber: true,
              name: true,
              unit: true,
              stockQuantity: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.WorkOrderSelect;

const allowedTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  Received: [WorkOrderStatus.Diagnosing, WorkOrderStatus.Cancelled],
  Diagnosing: [WorkOrderStatus.Repairing, WorkOrderStatus.WaitingParts, WorkOrderStatus.Cancelled],
  Repairing: [WorkOrderStatus.WaitingParts, WorkOrderStatus.ReadyForDelivery, WorkOrderStatus.Cancelled],
  WaitingParts: [WorkOrderStatus.Repairing, WorkOrderStatus.Cancelled],
  ReadyForDelivery: [WorkOrderStatus.Delivered, WorkOrderStatus.Cancelled],
  Delivered: [],
  Cancelled: [],
};

@Injectable()
export class WorkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: WorkOrderQueryDto = {}) {
    const keyword = query.search?.trim();

    return this.prisma.workOrder.findMany({
      where: {
        status: query.status,
        vehicleId: query.vehicleId,
        ...(keyword
          ? {
              OR: [
                { diagnosis: { contains: keyword, mode: 'insensitive' } },
                {
                  vehicle: {
                    OR: [
                      { licensePlate: { contains: keyword, mode: 'insensitive' } },
                      { make: { contains: keyword, mode: 'insensitive' } },
                      { model: { contains: keyword, mode: 'insensitive' } },
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
              ],
            }
          : {}),
      },
      select: workOrderSelect,
      orderBy: { receivedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id },
      select: workOrderSelect,
    });
    if (!workOrder) throw new NotFoundException(`Work order ${id} not found`);
    return workOrder;
  }

  async create(dto: CreateWorkOrderDto, advisorId?: string) {
    const source = await this.resolveVehicleSource(dto);

    return this.prisma.$transaction(async (tx) => {
      const workOrder = await tx.workOrder.create({
        data: {
          vehicleId: source.vehicleId,
          appointmentId: source.appointmentId,
          diagnosis: dto.diagnosis || null,
          technicianId: dto.technicianId || null,
          advisorId: advisorId ?? null,
        },
        select: workOrderSelect,
      });

      if (source.appointmentId) {
        await tx.appointment.update({
          where: { id: source.appointmentId },
          data: { status: AppointmentStatus.Arrived },
        });
      }

      return workOrder;
    });
  }

  async updateStatus(id: string, dto: UpdateWorkOrderStatusDto) {
    const workOrder = await this.findById(id);
    if (!this.canTransition(workOrder.status, dto.status)) {
      throw new BadRequestException(`Cannot change work order status from ${workOrder.status} to ${dto.status}`);
    }
    if (dto.status === WorkOrderStatus.Delivered) {
      const invoice = await this.prisma.invoice.findUnique({
        where: { workOrderId: id },
        select: { status: true },
      });
      if (!invoice || invoice.status !== 'Paid') {
        throw new ConflictException('Work order requires a paid invoice before delivery');
      }
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: {
        status: dto.status,
        diagnosis: dto.diagnosis === undefined ? undefined : dto.diagnosis || null,
        deliveredAt: dto.status === WorkOrderStatus.Delivered ? new Date() : undefined,
      },
      select: workOrderSelect,
    });
  }

  async addItem(workOrderId: string, dto: CreateWorkOrderItemDto) {
    await this.assertEditableWorkOrder(workOrderId);
    if (dto.serviceId) await this.assertServiceExists(dto.serviceId);
    const amount = new Prisma.Decimal(dto.unitPrice).mul(dto.quantity);

    return this.prisma.workOrderItem.create({
      data: {
        workOrderId,
        serviceId: dto.serviceId || null,
        description: dto.description,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        amount,
      },
    });
  }

  async updateItem(workOrderId: string, itemId: string, dto: UpdateWorkOrderItemDto) {
    await this.assertEditableWorkOrder(workOrderId);
    const item = await this.assertItemBelongsToWorkOrder(workOrderId, itemId);
    if (dto.serviceId) await this.assertServiceExists(dto.serviceId);
    const quantity = dto.quantity ?? item.quantity;
    const unitPrice = dto.unitPrice === undefined ? item.unitPrice : new Prisma.Decimal(dto.unitPrice);

    return this.prisma.workOrderItem.update({
      where: { id: itemId },
      data: {
        serviceId: dto.serviceId === undefined ? undefined : dto.serviceId || null,
        description: dto.description,
        quantity: dto.quantity,
        unitPrice,
        amount: unitPrice.mul(quantity),
      },
    });
  }

  async deleteItem(workOrderId: string, itemId: string) {
    await this.assertEditableWorkOrder(workOrderId);
    await this.assertItemBelongsToWorkOrder(workOrderId, itemId);
    const usageCount = await this.prisma.partUsage.count({ where: { workOrderItemId: itemId } });
    if (usageCount > 0) {
      throw new ConflictException('Remove linked part usages before deleting this work order item');
    }
    await this.prisma.workOrderItem.delete({ where: { id: itemId } });
    return { id: itemId };
  }

  async addPartUsage(workOrderId: string, dto: CreatePartUsageDto, performedBy: string) {
    await this.assertEditableWorkOrder(workOrderId);
    await this.assertItemBelongsToWorkOrder(workOrderId, dto.workOrderItemId);

    return this.prisma.$transaction(async (tx) => {
      const part = await this.findActivePart(tx, dto.partId);
      await this.decrementStock(tx, part.id, dto.quantity, part.stockQuantity);

      const usage = await tx.partUsage.create({
        data: {
          workOrderItemId: dto.workOrderItemId,
          partId: dto.partId,
          quantity: dto.quantity,
          unitPrice: dto.unitPrice ?? part.unitPrice,
        },
        include: { part: true },
      });

      await this.recordStockMovement(
        tx,
        part.id,
        TransactionType.Export,
        -dto.quantity,
        usage.id,
        `Part usage for work order ${workOrderId}`,
        performedBy,
      );

      return usage;
    });
  }

  async updatePartUsage(
    workOrderId: string,
    usageId: string,
    dto: UpdatePartUsageDto,
    performedBy: string,
  ) {
    await this.assertEditableWorkOrder(workOrderId);
    const usage = await this.assertUsageBelongsToWorkOrder(workOrderId, usageId);
    const nextPartId = dto.partId ?? usage.partId;
    const nextQuantity = dto.quantity ?? usage.quantity;

    return this.prisma.$transaction(async (tx) => {
      if (nextPartId === usage.partId) {
        const quantityDelta = nextQuantity - usage.quantity;
        if (quantityDelta > 0) {
          const part = await this.findActivePart(tx, usage.partId);
          await this.decrementStock(tx, part.id, quantityDelta, part.stockQuantity);
          await this.recordStockMovement(
            tx,
            part.id,
            TransactionType.Export,
            -quantityDelta,
            usage.id,
            `Part usage increased for work order ${workOrderId}`,
            performedBy,
          );
        } else if (quantityDelta < 0) {
          await tx.part.update({
            where: { id: usage.partId },
            data: { stockQuantity: { increment: Math.abs(quantityDelta) } },
          });
          await this.recordStockMovement(
            tx,
            usage.partId,
            TransactionType.Import,
            Math.abs(quantityDelta),
            usage.id,
            `Part usage reduced for work order ${workOrderId}`,
            performedBy,
          );
        }
      } else {
        const nextPart = await this.findActivePart(tx, nextPartId);
        await this.decrementStock(tx, nextPart.id, nextQuantity, nextPart.stockQuantity);
        await tx.part.update({
          where: { id: usage.partId },
          data: { stockQuantity: { increment: usage.quantity } },
        });
        await this.recordStockMovement(
          tx,
          usage.partId,
          TransactionType.Import,
          usage.quantity,
          usage.id,
          `Part usage replaced for work order ${workOrderId}`,
          performedBy,
        );
        await this.recordStockMovement(
          tx,
          nextPart.id,
          TransactionType.Export,
          -nextQuantity,
          usage.id,
          `Part usage replacement for work order ${workOrderId}`,
          performedBy,
        );
      }

      return tx.partUsage.update({
        where: { id: usage.id },
        data: {
          partId: dto.partId,
          quantity: dto.quantity,
          unitPrice: dto.unitPrice,
        },
        include: { part: true },
      });
    });
  }

  async deletePartUsage(workOrderId: string, usageId: string, performedBy: string) {
    await this.assertEditableWorkOrder(workOrderId);
    const usage = await this.assertUsageBelongsToWorkOrder(workOrderId, usageId);

    await this.prisma.$transaction(async (tx) => {
      await tx.part.update({
        where: { id: usage.partId },
        data: { stockQuantity: { increment: usage.quantity } },
      });
      await tx.partUsage.delete({ where: { id: usage.id } });
      await this.recordStockMovement(
        tx,
        usage.partId,
        TransactionType.Import,
        usage.quantity,
        usage.id,
        `Part usage removed from work order ${workOrderId}`,
        performedBy,
      );
    });

    return { id: usage.id };
  }

  private async resolveVehicleSource(dto: CreateWorkOrderDto) {
    if (dto.appointmentId) {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: dto.appointmentId },
        select: {
          id: true,
          vehicleId: true,
          status: true,
          workOrder: { select: { id: true } },
        },
      });
      if (!appointment) throw new NotFoundException(`Appointment ${dto.appointmentId} not found`);
      if (appointment.status === AppointmentStatus.Cancelled) {
        throw new ConflictException('Cancelled appointment cannot become a work order');
      }
      if (appointment.workOrder) {
        throw new ConflictException('Appointment already has a work order');
      }
      return { vehicleId: appointment.vehicleId, appointmentId: appointment.id };
    }

    if (!dto.vehicleId) throw new BadRequestException('vehicleId is required');
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
      select: { id: true },
    });
    if (!vehicle) throw new NotFoundException(`Vehicle ${dto.vehicleId} not found`);
    return { vehicleId: vehicle.id, appointmentId: null };
  }

  private async assertEditableWorkOrder(id: string) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        invoice: { select: { id: true } },
      },
    });
    if (!workOrder) throw new NotFoundException(`Work order ${id} not found`);
    if (workOrder.status === WorkOrderStatus.Delivered || workOrder.status === WorkOrderStatus.Cancelled) {
      throw new ConflictException('Delivered or cancelled work orders cannot be edited');
    }
    if (workOrder.invoice) {
      throw new ConflictException('Invoiced work orders cannot be edited');
    }
    return workOrder;
  }

  private async assertItemBelongsToWorkOrder(workOrderId: string, itemId: string) {
    const item = await this.prisma.workOrderItem.findFirst({
      where: { id: itemId, workOrderId },
    });
    if (!item) throw new NotFoundException(`Work order item ${itemId} not found`);
    return item;
  }

  private async assertUsageBelongsToWorkOrder(workOrderId: string, usageId: string) {
    const usage = await this.prisma.partUsage.findFirst({
      where: {
        id: usageId,
        workOrderItem: { workOrderId },
      },
    });
    if (!usage) throw new NotFoundException(`Part usage ${usageId} not found`);
    return usage;
  }

  private async findActivePart(tx: Prisma.TransactionClient, partId: string) {
    const part = await tx.part.findUnique({
      where: { id: partId },
      select: {
        id: true,
        isActive: true,
        stockQuantity: true,
        unitPrice: true,
      },
    });
    if (!part || !part.isActive) throw new NotFoundException(`Active part ${partId} not found`);
    return part;
  }

  private async decrementStock(
    tx: Prisma.TransactionClient,
    partId: string,
    quantity: number,
    currentQuantity: number,
  ) {
    const updated = await tx.part.updateMany({
      where: {
        id: partId,
        stockQuantity: { gte: quantity },
      },
      data: { stockQuantity: { decrement: quantity } },
    });
    if (updated.count === 0) {
      throw new BadRequestException(`Insufficient stock: current quantity is ${currentQuantity}`);
    }
  }

  private recordStockMovement(
    tx: Prisma.TransactionClient,
    partId: string,
    type: TransactionType,
    quantityDelta: number,
    referenceId: string,
    note: string,
    performedBy: string,
  ) {
    return tx.inventoryTransaction.create({
      data: {
        partId,
        type,
        quantityDelta,
        referenceId,
        note,
        performedBy,
      },
    });
  }

  private async assertServiceExists(serviceId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, isActive: true },
    });
    if (!service || !service.isActive) throw new NotFoundException(`Active service ${serviceId} not found`);
  }

  private canTransition(current: WorkOrderStatus, next: WorkOrderStatus) {
    return current === next || allowedTransitions[current].includes(next);
  }
}
