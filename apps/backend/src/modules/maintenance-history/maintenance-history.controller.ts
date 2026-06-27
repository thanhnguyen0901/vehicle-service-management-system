import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  MaintenanceHistoryQueryDto,
  MaintenanceHistoryQuerySchema,
} from './dto/maintenance-history.dto';
import { MaintenanceHistoryService } from './maintenance-history.service';

@Controller('maintenance-history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceHistoryController {
  constructor(private readonly maintenanceHistoryService: MaintenanceHistoryService) {}

  @Get()
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.InventoryClerk, Role.Cashier, Role.Manager)
  findAll(@Query(new ZodValidationPipe(MaintenanceHistoryQuerySchema)) query: MaintenanceHistoryQueryDto) {
    return this.maintenanceHistoryService.findAll(query);
  }
}
