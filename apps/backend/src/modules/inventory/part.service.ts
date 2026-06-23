import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePartDto, PartQueryDto, TogglePartDto, UpdatePartDto } from './dto/part.dto';

const partSelect = {
  id: true,
  partNumber: true,
  name: true,
  description: true,
  unit: true,
  unitCost: true,
  unitPrice: true,
  stockQuantity: true,
  reorderLevel: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PartSelect;

@Injectable()
export class PartService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PartQueryDto = {}) {
    const keyword = query.search?.trim();

    return this.prisma.part.findMany({
      where: {
        isActive: query.isActive,
        ...(query.lowStock
          ? {
              stockQuantity: {
                lte: this.prisma.part.fields.reorderLevel,
              },
            }
          : {}),
        ...(keyword
          ? {
              OR: [
                { partNumber: { contains: keyword, mode: 'insensitive' } },
                { name: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
                { unit: { contains: keyword, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: partSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const part = await this.prisma.part.findUnique({
      where: { id },
      select: partSelect,
    });
    if (!part) throw new NotFoundException(`Part ${id} not found`);
    return part;
  }

  async create(dto: CreatePartDto) {
    try {
      return await this.prisma.part.create({
        data: {
          partNumber: dto.partNumber,
          name: dto.name,
          description: dto.description || null,
          unit: dto.unit,
          unitCost: dto.unitCost,
          unitPrice: dto.unitPrice,
          stockQuantity: dto.stockQuantity,
          reorderLevel: dto.reorderLevel,
          isActive: dto.isActive ?? true,
        },
        select: partSelect,
      });
    } catch (error) {
      this.handleUniqueError(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdatePartDto) {
    await this.findById(id);

    try {
      return await this.prisma.part.update({
        where: { id },
        data: {
          ...dto,
          description: dto.description === undefined ? undefined : dto.description || null,
        },
        select: partSelect,
      });
    } catch (error) {
      this.handleUniqueError(error);
      throw error;
    }
  }

  async toggle(id: string, dto: TogglePartDto) {
    await this.findById(id);
    return this.prisma.part.update({
      where: { id },
      data: { isActive: dto.isActive },
      select: partSelect,
    });
  }

  async deactivate(id: string) {
    await this.findById(id);
    return this.prisma.part.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    });
  }

  private handleUniqueError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Part number already exists');
    }
  }
}

