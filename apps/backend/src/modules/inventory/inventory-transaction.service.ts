import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateInventoryAdjustmentDto,
  CreateInventoryMovementDto,
  InventoryTransactionQueryDto,
} from './dto/inventory-transaction.dto';

const transactionSelect = {
  id: true,
  type: true,
  quantityDelta: true,
  referenceId: true,
  note: true,
  performedBy: true,
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
} satisfies Prisma.InventoryTransactionSelect;

@Injectable()
export class InventoryTransactionService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: InventoryTransactionQueryDto = {}) {
    return this.prisma.inventoryTransaction.findMany({
      where: {
        partId: query.partId,
        type: query.type,
        createdAt:
          query.from || query.to
            ? {
                gte: query.from,
                lte: query.to,
              }
            : undefined,
      },
      select: transactionSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  createImport(dto: CreateInventoryMovementDto, performedBy: string) {
    return this.applyMovement(
      dto.partId,
      TransactionType.Import,
      dto.quantity,
      dto.referenceId,
      dto.note,
      performedBy,
    );
  }

  createExport(dto: CreateInventoryMovementDto, performedBy: string) {
    return this.applyMovement(
      dto.partId,
      TransactionType.Export,
      -dto.quantity,
      dto.referenceId,
      dto.note,
      performedBy,
    );
  }

  createAdjustment(dto: CreateInventoryAdjustmentDto, performedBy: string) {
    return this.applyMovement(
      dto.partId,
      TransactionType.Adjustment,
      dto.quantityDelta,
      dto.referenceId,
      dto.note,
      performedBy,
    );
  }

  private async applyMovement(
    partId: string,
    type: TransactionType,
    quantityDelta: number,
    referenceId: string | null | undefined,
    note: string | null | undefined,
    performedBy: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const part = await tx.part.findUnique({
        where: { id: partId },
        select: { id: true, isActive: true, stockQuantity: true },
      });

      if (!part) throw new NotFoundException(`Part ${partId} not found`);
      if (!part.isActive) throw new BadRequestException('Cannot transact an inactive part');

      if (quantityDelta < 0) {
        const updated = await tx.part.updateMany({
          where: {
            id: partId,
            stockQuantity: { gte: Math.abs(quantityDelta) },
          },
          data: { stockQuantity: { increment: quantityDelta } },
        });

        if (updated.count === 0) {
          throw new BadRequestException(
            `Insufficient stock: current quantity is ${part.stockQuantity}`,
          );
        }
      } else {
        await tx.part.update({
          where: { id: partId },
          data: { stockQuantity: { increment: quantityDelta } },
        });
      }

      return tx.inventoryTransaction.create({
        data: {
          partId,
          type,
          quantityDelta,
          referenceId: referenceId || null,
          note: note || null,
          performedBy,
        },
        select: transactionSelect,
      });
    });
  }
}
