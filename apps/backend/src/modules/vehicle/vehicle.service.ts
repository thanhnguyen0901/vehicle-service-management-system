import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto, UpdateVehicleDto, VehicleQueryDto } from './dto/vehicle.dto';

const vehicleSelect = {
  id: true,
  customerId: true,
  licensePlate: true,
  make: true,
  model: true,
  year: true,
  color: true,
  vin: true,
  mileage: true,
  createdAt: true,
  updatedAt: true,
  customer: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      type: true,
      companyName: true,
    },
  },
} satisfies Prisma.VehicleSelect;

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: VehicleQueryDto = {}) {
    const keyword = query.search?.trim();

    return this.prisma.vehicle.findMany({
      where: {
        customerId: query.customerId,
        ...(keyword
          ? {
              OR: [
                { licensePlate: { contains: keyword, mode: 'insensitive' } },
                { make: { contains: keyword, mode: 'insensitive' } },
                { model: { contains: keyword, mode: 'insensitive' } },
                { vin: { contains: keyword, mode: 'insensitive' } },
                {
                  customer: {
                    OR: [
                      { fullName: { contains: keyword, mode: 'insensitive' } },
                      { phone: { contains: keyword, mode: 'insensitive' } },
                      { companyName: { contains: keyword, mode: 'insensitive' } },
                    ],
                  },
                },
              ],
            }
          : {}),
      },
      select: vehicleSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: vehicleSelect,
    });
    if (!vehicle) throw new NotFoundException(`Vehicle ${id} not found`);
    return vehicle;
  }

  async findHistory(id: string) {
    await this.findById(id);
    return this.prisma.workOrder.findMany({
      where: { vehicleId: id },
      include: {
        items: true,
        invoice: true,
      },
      orderBy: { receivedAt: 'desc' },
    });
  }

  async create(dto: CreateVehicleDto) {
    await this.assertCustomerExists(dto.customerId);

    try {
      return await this.prisma.vehicle.create({
        data: this.normalizeCreateData(dto),
        select: vehicleSelect,
      });
    } catch (error) {
      this.handleUniqueError(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateVehicleDto) {
    await this.findById(id);
    if (dto.customerId) await this.assertCustomerExists(dto.customerId);

    try {
      return await this.prisma.vehicle.update({
        where: { id },
        data: this.normalizeUpdateData(dto),
        select: vehicleSelect,
      });
    } catch (error) {
      this.handleUniqueError(error);
      throw error;
    }
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.vehicle.delete({ where: { id } });
    return { id };
  }

  private async assertCustomerExists(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });
    if (!customer) throw new NotFoundException(`Customer ${customerId} not found`);
  }

  private normalizeCreateData(dto: CreateVehicleDto): Prisma.VehicleUncheckedCreateInput {
    return {
      customerId: dto.customerId,
      licensePlate: dto.licensePlate,
      make: dto.make,
      model: dto.model,
      year: dto.year,
      color: dto.color || null,
      vin: dto.vin || null,
      mileage: dto.mileage ?? null,
    };
  }

  private normalizeUpdateData(dto: UpdateVehicleDto): Prisma.VehicleUncheckedUpdateInput {
    return {
      ...dto,
      color: dto.color === undefined ? undefined : dto.color || null,
      vin: dto.vin === undefined ? undefined : dto.vin || null,
      mileage: dto.mileage === undefined ? undefined : dto.mileage,
    };
  }

  private handleUniqueError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Vehicle license plate or VIN already exists');
    }
  }
}

