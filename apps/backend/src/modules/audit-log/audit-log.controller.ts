import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role, UserAccount } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuditLogService } from './audit-log.service';
import { AuditLogQueryDto, AuditLogQuerySchema } from './dto/audit-log.dto';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.InventoryClerk, Role.Cashier, Role.Manager)
  findAll(
    @Query(new ZodValidationPipe(AuditLogQuerySchema)) query: AuditLogQueryDto,
    @CurrentUser() user: UserAccount,
  ) {
    return this.auditLogService.findAll(query, user);
  }
}
