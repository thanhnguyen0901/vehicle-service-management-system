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
import { AppointmentService } from './appointment.service';
import {
  AppointmentQueryDto,
  AppointmentQuerySchema,
  CreateAppointmentDto,
  CreateAppointmentSchema,
  UpdateAppointmentDto,
  UpdateAppointmentSchema,
} from './dto/appointment.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.Manager)
  findAll(@Query(new ZodValidationPipe(AppointmentQuerySchema)) query: AppointmentQueryDto) {
    return this.appointmentService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.Manager)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentService.findById(id);
  }

  @Post()
  @Roles(Role.Admin, Role.ServiceAdvisor)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(CreateAppointmentSchema)) dto: CreateAppointmentDto,
    @CurrentUser() user: UserAccount,
  ) {
    return this.appointmentService.create(dto, user.id);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.ServiceAdvisor)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateAppointmentSchema)) dto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentService.delete(id);
  }
}
