import {
  Body,
  Controller,
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
  CreateServiceDto,
  CreateServiceSchema,
  ServiceQueryDto,
  ServiceQuerySchema,
  ToggleServiceDto,
  ToggleServiceSchema,
  UpdateServiceDto,
  UpdateServiceSchema,
} from './dto/service-catalog.dto';
import { ServiceCatalogService } from './service-catalog.service';

@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceCatalogController {
  constructor(private readonly serviceCatalogService: ServiceCatalogService) {}

  @Get()
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.InventoryClerk, Role.Cashier, Role.Manager)
  findAll(@Query(new ZodValidationPipe(ServiceQuerySchema)) query: ServiceQueryDto) {
    return this.serviceCatalogService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.InventoryClerk, Role.Cashier, Role.Manager)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceCatalogService.findById(id);
  }

  @Post()
  @Roles(Role.Admin, Role.Manager)
  @HttpCode(HttpStatus.CREATED)
  create(@Body(new ZodValidationPipe(CreateServiceSchema)) dto: CreateServiceDto) {
    return this.serviceCatalogService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Manager)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateServiceSchema)) dto: UpdateServiceDto,
  ) {
    return this.serviceCatalogService.update(id, dto);
  }

  @Patch(':id/toggle')
  @Roles(Role.Admin, Role.Manager)
  toggle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ToggleServiceSchema)) dto: ToggleServiceDto,
  ) {
    return this.serviceCatalogService.toggle(id, dto);
  }
}

