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
  CreatePartDto,
  CreatePartSchema,
  PartQueryDto,
  PartQuerySchema,
  TogglePartDto,
  TogglePartSchema,
  UpdatePartDto,
  UpdatePartSchema,
} from './dto/part.dto';
import { PartService } from './part.service';

@Controller('parts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartController {
  constructor(private readonly partService: PartService) {}

  @Get()
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.InventoryClerk, Role.Cashier, Role.Manager)
  findAll(@Query(new ZodValidationPipe(PartQuerySchema)) query: PartQueryDto) {
    return this.partService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.ServiceAdvisor, Role.Technician, Role.InventoryClerk, Role.Cashier, Role.Manager)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.partService.findById(id);
  }

  @Post()
  @Roles(Role.Admin, Role.InventoryClerk)
  @HttpCode(HttpStatus.CREATED)
  create(@Body(new ZodValidationPipe(CreatePartSchema)) dto: CreatePartDto) {
    return this.partService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.InventoryClerk)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdatePartSchema)) dto: UpdatePartDto,
  ) {
    return this.partService.update(id, dto);
  }

  @Patch(':id/toggle')
  @Roles(Role.Admin, Role.InventoryClerk)
  toggle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(TogglePartSchema)) dto: TogglePartDto,
  ) {
    return this.partService.toggle(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.InventoryClerk)
  @HttpCode(HttpStatus.OK)
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.partService.deactivate(id);
  }
}

