import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  DateRangeQueryDto,
  DateRangeQuerySchema,
  TopQueryDto,
  TopQuerySchema,
} from './dto/report.dto';
import { ReportService } from './report.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin, Role.Manager)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('revenue')
  revenue(@Query(new ZodValidationPipe(DateRangeQuerySchema)) query: DateRangeQueryDto) {
    return this.reportService.revenue(query);
  }

  @Get('work-orders')
  workOrders(@Query(new ZodValidationPipe(DateRangeQuerySchema)) query: DateRangeQueryDto) {
    return this.reportService.workOrders(query);
  }

  @Get('top-services')
  topServices(@Query(new ZodValidationPipe(TopQuerySchema)) query: TopQueryDto) {
    return this.reportService.topServices(query);
  }

  @Get('top-parts')
  topParts(@Query(new ZodValidationPipe(TopQuerySchema)) query: TopQueryDto) {
    return this.reportService.topParts(query);
  }

  @Get('low-stock')
  lowStock() {
    return this.reportService.lowStock();
  }
}
