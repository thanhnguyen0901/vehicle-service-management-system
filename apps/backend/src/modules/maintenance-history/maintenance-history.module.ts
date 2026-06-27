import { Module } from '@nestjs/common';
import { MaintenanceHistoryController } from './maintenance-history.controller';
import { MaintenanceHistoryService } from './maintenance-history.service';

@Module({
  controllers: [MaintenanceHistoryController],
  providers: [MaintenanceHistoryService],
})
export class MaintenanceHistoryModule {}
