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
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CreateReminderDto,
  CreateReminderSchema,
  ReminderQueryDto,
  ReminderQuerySchema,
  UpdateReminderDto,
  UpdateReminderSchema,
} from './dto/reminder.dto';
import { ReminderService } from './reminder.service';

@Controller('reminders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Get()
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.InventoryClerk, Role.Cashier, Role.Manager)
  findAll(@Query(new ZodValidationPipe(ReminderQuerySchema)) query: ReminderQueryDto) {
    return this.reminderService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.InventoryClerk, Role.Cashier, Role.Manager)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reminderService.findById(id);
  }

  @Post()
  @Roles(Role.Admin, Role.ServiceAdvisor)
  @HttpCode(HttpStatus.CREATED)
  create(@Body(new ZodValidationPipe(CreateReminderSchema)) dto: CreateReminderDto) {
    return this.reminderService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.ServiceAdvisor)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateReminderSchema)) dto: UpdateReminderDto,
  ) {
    return this.reminderService.update(id, dto);
  }

  @Patch(':id/send')
  @Roles(Role.Admin, Role.ServiceAdvisor)
  markSent(@Param('id', ParseUUIDPipe) id: string) {
    return this.reminderService.markSent(id);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.reminderService.delete(id);
  }
}
