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
import { CustomerService } from './customer.service';
import {
  CreateCustomerDto,
  CreateCustomerSchema,
  CustomerQueryDto,
  CustomerQuerySchema,
  UpdateCustomerDto,
  UpdateCustomerSchema,
} from './dto/customer.dto';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.InventoryClerk, Role.Cashier, Role.Manager)
  findAll(@Query(new ZodValidationPipe(CustomerQuerySchema)) query: CustomerQueryDto) {
    return this.customerService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.InventoryClerk, Role.Cashier, Role.Manager)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerService.findById(id);
  }

  @Get(':id/vehicles')
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.InventoryClerk, Role.Cashier, Role.Manager)
  findVehicles(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerService.findVehicles(id);
  }

  @Post()
  @Roles(Role.Admin, Role.ServiceAdvisor)
  @HttpCode(HttpStatus.CREATED)
  create(@Body(new ZodValidationPipe(CreateCustomerSchema)) dto: CreateCustomerDto) {
    return this.customerService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.ServiceAdvisor)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateCustomerSchema)) dto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerService.delete(id);
  }
}

