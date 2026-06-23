import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto, CustomerQueryDto, UpdateCustomerDto } from './dto/customer.dto';

const customerSelect = {
  id: true,
  fullName: true,
  phone: true,
  email: true,
  address: true,
  type: true,
  companyName: true,
  taxCode: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      vehicles: true,
    },
  },
} satisfies Prisma.CustomerSelect;

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CustomerQueryDto = {}) {
    const keyword = query.search?.trim();

    return this.prisma.customer.findMany({
      where: {
        type: query.type,
        ...(keyword
          ? {
              OR: [
                { fullName: { contains: keyword, mode: 'insensitive' } },
                { phone: { contains: keyword, mode: 'insensitive' } },
                { email: { contains: keyword, mode: 'insensitive' } },
                { companyName: { contains: keyword, mode: 'insensitive' } },
                { taxCode: { contains: keyword, mode: 'insensitive' } },
                {
                  vehicles: {
                    some: {
                      licensePlate: { contains: keyword, mode: 'insensitive' },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      select: customerSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      select: customerSelect,
    });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async findVehicles(id: string) {
    await this.findById(id);
    return this.prisma.vehicle.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateCustomerDto) {
    try {
      return await this.prisma.customer.create({
        data: this.normalizeCreateData(dto),
        select: customerSelect,
      });
    } catch (error) {
      this.handleUniqueError(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findById(id);

    try {
      return await this.prisma.customer.update({
        where: { id },
        data: this.normalizeUpdateData(dto),
        select: customerSelect,
      });
    } catch (error) {
      this.handleUniqueError(error);
      throw error;
    }
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.customer.delete({ where: { id } });
    return { id };
  }

  private normalizeCreateData(dto: CreateCustomerDto): Prisma.CustomerCreateInput {
    return {
      fullName: dto.fullName,
      phone: dto.phone,
      type: dto.type,
      email: dto.email || null,
      address: dto.address || null,
      companyName: dto.companyName || null,
      taxCode: dto.taxCode || null,
      notes: dto.notes || null,
    };
  }

  private normalizeUpdateData(dto: UpdateCustomerDto): Prisma.CustomerUpdateInput {
    return {
      ...dto,
      email: dto.email === undefined ? undefined : dto.email || null,
      address: dto.address === undefined ? undefined : dto.address || null,
      companyName: dto.companyName === undefined ? undefined : dto.companyName || null,
      taxCode: dto.taxCode === undefined ? undefined : dto.taxCode || null,
      notes: dto.notes === undefined ? undefined : dto.notes || null,
    };
  }

  private handleUniqueError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Customer phone or email already exists');
    }
  }
}
