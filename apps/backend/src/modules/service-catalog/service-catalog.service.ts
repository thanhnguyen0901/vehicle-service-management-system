import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto, ServiceQueryDto, ToggleServiceDto, UpdateServiceDto } from './dto/service-catalog.dto';

const serviceSelect = {
  id: true,
  name: true,
  description: true,
  unitPrice: true,
  durationMin: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ServiceSelect;

@Injectable()
export class ServiceCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ServiceQueryDto = {}) {
    const keyword = query.search?.trim();

    return this.prisma.service.findMany({
      where: {
        isActive: query.isActive,
        ...(keyword
          ? {
              OR: [
                { name: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: serviceSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      select: serviceSelect,
    });
    if (!service) throw new NotFoundException(`Service ${id} not found`);
    return service;
  }

  async create(dto: CreateServiceDto) {
    return this.prisma.service.create({
      data: {
        name: dto.name,
        description: dto.description || null,
        unitPrice: dto.unitPrice,
        durationMin: dto.durationMin ?? null,
        isActive: dto.isActive ?? true,
      },
      select: serviceSelect,
    });
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findById(id);

    return this.prisma.service.update({
      where: { id },
      data: {
        ...dto,
        description: dto.description === undefined ? undefined : dto.description || null,
        durationMin: dto.durationMin === undefined ? undefined : dto.durationMin,
      },
      select: serviceSelect,
    });
  }

  async toggle(id: string, dto: ToggleServiceDto) {
    await this.findById(id);
    return this.prisma.service.update({
      where: { id },
      data: { isActive: dto.isActive },
      select: serviceSelect,
    });
  }
}

