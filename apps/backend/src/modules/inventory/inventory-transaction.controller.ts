import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { Role, UserAccount } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CreateInventoryAdjustmentDto,
  CreateInventoryAdjustmentSchema,
  CreateInventoryMovementDto,
  CreateInventoryMovementSchema,
  InventoryTransactionQueryDto,
  InventoryTransactionQuerySchema,
} from './dto/inventory-transaction.dto';
import { InventoryTransactionService } from './inventory-transaction.service';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryTransactionController {
  constructor(private readonly inventoryTransactionService: InventoryTransactionService) {}

  @Get('transactions')
  @Roles(
    Role.Admin,
    Role.ServiceAdvisor,
    Role.Technician,
    Role.InventoryClerk,
    Role.Cashier,
    Role.Manager,
  )
  findAll(
    @Query(new ZodValidationPipe(InventoryTransactionQuerySchema))
    query: InventoryTransactionQueryDto,
  ) {
    return this.inventoryTransactionService.findAll(query);
  }

  @Post('import')
  @Roles(Role.Admin, Role.InventoryClerk)
  @HttpCode(HttpStatus.CREATED)
  createImport(
    @Body(new ZodValidationPipe(CreateInventoryMovementSchema))
    dto: CreateInventoryMovementDto,
    @CurrentUser() user: UserAccount,
  ) {
    return this.inventoryTransactionService.createImport(dto, user.id);
  }

  @Post('export')
  @Roles(Role.Admin, Role.InventoryClerk)
  @HttpCode(HttpStatus.CREATED)
  createExport(
    @Body(new ZodValidationPipe(CreateInventoryMovementSchema))
    dto: CreateInventoryMovementDto,
    @CurrentUser() user: UserAccount,
  ) {
    return this.inventoryTransactionService.createExport(dto, user.id);
  }

  @Post('adjustment')
  @Roles(Role.Admin, Role.InventoryClerk)
  @HttpCode(HttpStatus.CREATED)
  createAdjustment(
    @Body(new ZodValidationPipe(CreateInventoryAdjustmentSchema))
    dto: CreateInventoryAdjustmentDto,
    @CurrentUser() user: UserAccount,
  ) {
    return this.inventoryTransactionService.createAdjustment(dto, user.id);
  }
}
