import { Injectable } from '@nestjs/common';
import { Prisma, WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MaintenanceHistoryQueryDto } from './dto/maintenance-history.dto';

const maintenanceHistorySelect = {
  id: true,
  status: true,
  diagnosis: true,
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
      year: true,
      mileage: true,
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
  items: {
    select: {
      id: true,
      description: true,
      quantity: true,
      unitPrice: true,
      amount: true,
      service: {
        select: {
          id: true,
          name: true,
        },
      },
      partUsages: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          createdAt: true,
          part: {
            select: {
              id: true,
              partNumber: true,
              name: true,
              unit: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  },
  invoice: {
    select: {
      id: true,
      status: true,
      totalAmount: true,
      discount: true,
      tax: true,
      issuedAt: true,
      paidAt: true,
      payments: {
        select: {
          id: true,
          amount: true,
          method: true,
          transactionRef: true,
          paidAt: true,
        },
        orderBy: { paidAt: 'asc' },
      },
    },
  },
} satisfies Prisma.WorkOrderSelect;

@Injectable()
export class MaintenanceHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: MaintenanceHistoryQueryDto = {}) {
    const keyword = query.search?.trim();

    return this.prisma.workOrder.findMany({
      where: {
        status: WorkOrderStatus.Delivered,
        vehicleId: query.vehicleId,
        vehicle: {
          customerId: query.customerId,
          ...(keyword
            ? {
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
              }
            : {}),
        },
      },
      select: maintenanceHistorySelect,
      orderBy: [{ deliveredAt: 'desc' }, { receivedAt: 'desc' }],
    });
  }
}
