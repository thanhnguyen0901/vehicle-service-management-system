import { Injectable } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DateRangeQueryDto, TopQueryDto } from './dto/report.dto';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async revenue(query: DateRangeQueryDto = {}) {
    const payments = await this.prisma.payment.findMany({
      where: {
        paidAt: this.dateFilter(query),
      },
      select: {
        amount: true,
        paidAt: true,
      },
      orderBy: { paidAt: 'asc' },
    });

    const byDate = new Map<string, number>();
    let total = 0;
    for (const payment of payments) {
      const amount = Number(payment.amount);
      total += amount;
      const date = payment.paidAt.toISOString().slice(0, 10);
      byDate.set(date, (byDate.get(date) ?? 0) + amount);
    }

    return {
      totalRevenue: total,
      paymentCount: payments.length,
      series: Array.from(byDate.entries()).map(([date, amount]) => ({ date, amount })),
    };
  }

  async workOrders(query: DateRangeQueryDto = {}) {
    const rows = await this.prisma.workOrder.groupBy({
      by: ['status'],
      where: {
        createdAt: this.dateFilter(query),
      },
      _count: { _all: true },
    });

    const counts = Object.values(WorkOrderStatus).map((status) => ({
      status,
      count: rows.find((row) => row.status === status)?._count._all ?? 0,
    }));

    return {
      total: counts.reduce((sum, row) => sum + row.count, 0),
      counts,
    };
  }

  async topServices(query: TopQueryDto) {
    const items = await this.prisma.workOrderItem.findMany({
      where: {
        serviceId: { not: null },
        workOrder: {
          invoice: {
            issuedAt: this.dateFilter(query),
          },
        },
      },
      select: {
        serviceId: true,
        description: true,
        quantity: true,
        amount: true,
        service: {
          select: {
            name: true,
          },
        },
      },
    });

    const grouped = new Map<string, { serviceId: string; name: string; quantity: number; revenue: number }>();
    for (const item of items) {
      if (!item.serviceId) continue;
      const current = grouped.get(item.serviceId) ?? {
        serviceId: item.serviceId,
        name: item.service?.name ?? item.description,
        quantity: 0,
        revenue: 0,
      };
      current.quantity += item.quantity;
      current.revenue += Number(item.amount);
      grouped.set(item.serviceId, current);
    }

    return Array.from(grouped.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, query.limit);
  }

  async topParts(query: TopQueryDto) {
    const usages = await this.prisma.partUsage.findMany({
      where: {
        workOrderItem: {
          workOrder: {
            invoice: {
              issuedAt: this.dateFilter(query),
            },
          },
        },
      },
      select: {
        partId: true,
        quantity: true,
        unitPrice: true,
        part: {
          select: {
            partNumber: true,
            name: true,
          },
        },
      },
    });

    const grouped = new Map<string, { partId: string; partNumber: string; name: string; quantity: number; revenue: number }>();
    for (const usage of usages) {
      const current = grouped.get(usage.partId) ?? {
        partId: usage.partId,
        partNumber: usage.part.partNumber,
        name: usage.part.name,
        quantity: 0,
        revenue: 0,
      };
      current.quantity += usage.quantity;
      current.revenue += Number(usage.unitPrice) * usage.quantity;
      grouped.set(usage.partId, current);
    }

    return Array.from(grouped.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, query.limit);
  }

  lowStock() {
    return this.prisma.part.findMany({
      where: {
        stockQuantity: {
          lte: this.prisma.part.fields.reorderLevel,
        },
        isActive: true,
      },
      select: {
        id: true,
        partNumber: true,
        name: true,
        unit: true,
        stockQuantity: true,
        reorderLevel: true,
      },
      orderBy: [{ stockQuantity: 'asc' }, { name: 'asc' }],
    });
  }

  private dateFilter(query: DateRangeQueryDto) {
    const to = query.to ? new Date(query.to) : undefined;
    if (to) {
      to.setHours(23, 59, 59, 999);
    }

    return query.from || query.to
      ? {
          gte: query.from,
          lte: to,
        }
      : undefined;
  }
}
