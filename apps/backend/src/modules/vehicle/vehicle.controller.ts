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
import { CreateVehicleDto, CreateVehicleSchema, UpdateVehicleDto, UpdateVehicleSchema, VehicleQueryDto, VehicleQuerySchema } from './dto/vehicle.dto';
import { VehicleService } from './vehicle.service';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.InventoryClerk, Role.Cashier, Role.Manager)
  findAll(@Query(new ZodValidationPipe(VehicleQuerySchema)) query: VehicleQueryDto) {
    return this.vehicleService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.InventoryClerk, Role.Cashier, Role.Manager)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehicleService.findById(id);
  }

  @Get(':id/history')
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.InventoryClerk, Role.Cashier, Role.Manager)
  findHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehicleService.findHistory(id);
  }

  @Post()
  @Roles(Role.Admin, Role.ServiceAdvisor)
  @HttpCode(HttpStatus.CREATED)
  create(@Body(new ZodValidationPipe(CreateVehicleSchema)) dto: CreateVehicleDto) {
    return this.vehicleService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.ServiceAdvisor)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateVehicleSchema)) dto: UpdateVehicleDto,
  ) {
    return this.vehicleService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehicleService.delete(id);
  }
}

