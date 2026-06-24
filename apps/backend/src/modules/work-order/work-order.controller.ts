import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role, UserAccount } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CreateWorkOrderDto,
  CreateWorkOrderItemDto,
  CreateWorkOrderItemSchema,
  CreateWorkOrderSchema,
  CreatePartUsageDto,
  CreatePartUsageSchema,
  UpdatePartUsageDto,
  UpdatePartUsageSchema,
  UpdateWorkOrderItemDto,
  UpdateWorkOrderItemSchema,
  UpdateWorkOrderStatusDto,
  UpdateWorkOrderStatusSchema,
  WorkOrderQueryDto,
  WorkOrderQuerySchema,
} from './dto/work-order.dto';
import { WorkOrderService } from './work-order.service';

@Controller('work-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Get()
  @Roles(
    Role.Admin,
    Role.ServiceAdvisor,
    Role.Technician,
    Role.InventoryClerk,
    Role.Cashier,
    Role.Manager,
  )
  findAll(@Query(new ZodValidationPipe(WorkOrderQuerySchema)) query: WorkOrderQueryDto) {
    return this.workOrderService.findAll(query);
  }

  @Get(':id')
  @Roles(
    Role.Admin,
    Role.ServiceAdvisor,
    Role.Technician,
    Role.InventoryClerk,
    Role.Cashier,
    Role.Manager,
  )
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workOrderService.findById(id);
  }

  @Post()
  @Roles(Role.Admin, Role.ServiceAdvisor)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(CreateWorkOrderSchema)) dto: CreateWorkOrderDto,
    @CurrentUser() user: UserAccount,
  ) {
    return this.workOrderService.create(dto, user.id);
  }

  @Patch(':id/status')
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateWorkOrderStatusSchema)) dto: UpdateWorkOrderStatusDto,
  ) {
    return this.workOrderService.updateStatus(id, dto);
  }

  @Post(':id/items')
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician)
  @HttpCode(HttpStatus.CREATED)
  addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(CreateWorkOrderItemSchema)) dto: CreateWorkOrderItemDto,
  ) {
    return this.workOrderService.addItem(id, dto);
  }

  @Patch(':id/items/:itemId')
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician)
  updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body(new ZodValidationPipe(UpdateWorkOrderItemSchema)) dto: UpdateWorkOrderItemDto,
  ) {
    return this.workOrderService.updateItem(id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician)
  @HttpCode(HttpStatus.OK)
  deleteItem(@Param('id', ParseUUIDPipe) id: string, @Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.workOrderService.deleteItem(id, itemId);
  }

  @Post(':id/part-usages')
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.InventoryClerk)
  @HttpCode(HttpStatus.CREATED)
  addPartUsage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(CreatePartUsageSchema)) dto: CreatePartUsageDto,
    @CurrentUser() user: UserAccount,
  ) {
    return this.workOrderService.addPartUsage(id, dto, user.id);
  }

  @Patch(':id/part-usages/:usageId')
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.InventoryClerk)
  updatePartUsage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('usageId', ParseUUIDPipe) usageId: string,
    @Body(new ZodValidationPipe(UpdatePartUsageSchema)) dto: UpdatePartUsageDto,
    @CurrentUser() user: UserAccount,
  ) {
    return this.workOrderService.updatePartUsage(id, usageId, dto, user.id);
  }

  @Delete(':id/part-usages/:usageId')
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.InventoryClerk)
  @HttpCode(HttpStatus.OK)
  deletePartUsage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('usageId', ParseUUIDPipe) usageId: string,
    @CurrentUser() user: UserAccount,
  ) {
    return this.workOrderService.deletePartUsage(id, usageId, user.id);
  }
}
