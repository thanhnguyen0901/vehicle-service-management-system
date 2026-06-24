import { Module } from '@nestjs/common';
import { InventoryTransactionController } from './inventory-transaction.controller';
import { InventoryTransactionService } from './inventory-transaction.service';
import { PartController } from './part.controller';
import { PartService } from './part.service';

@Module({
  controllers: [PartController, InventoryTransactionController],
  providers: [PartService, InventoryTransactionService],
})
export class InventoryModule {}
