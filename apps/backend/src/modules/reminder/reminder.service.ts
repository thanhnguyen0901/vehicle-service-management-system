import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReminderDto, ReminderQueryDto, UpdateReminderDto } from './dto/reminder.dto';

const reminderSelect = {
  id: true,
  customerId: true,
  vehicleId: true,
  message: true,
  dueDate: true,
  sentAt: true,
  isSent: true,
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
  vehicle: {
    select: {
      id: true,
      licensePlate: true,
      make: true,
      model: true,
      year: true,
    },
  },
} satisfies Prisma.MaintenanceReminderSelect;

@Injectable()
export class ReminderService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: ReminderQueryDto = {}) {
    const keyword = query.search?.trim();

    return this.prisma.maintenanceReminder.findMany({
      where: {
        customerId: query.customerId,
        vehicleId: query.vehicleId,
        isSent: query.isSent,
        dueDate:
          query.dueFrom || query.dueTo
            ? {
                gte: query.dueFrom,
                lte: query.dueTo,
              }
            : undefined,
        ...(keyword
          ? {
              OR: [
                { message: { contains: keyword, mode: 'insensitive' } },
                {
                  customer: {
                    OR: [
                      { fullName: { contains: keyword, mode: 'insensitive' } },
                      { phone: { contains: keyword, mode: 'insensitive' } },
                      { companyName: { contains: keyword, mode: 'insensitive' } },
                    ],
                  },
                },
                {
                  vehicle: {
                    OR: [
                      { licensePlate: { contains: keyword, mode: 'insensitive' } },
                      { make: { contains: keyword, mode: 'insensitive' } },
                      { model: { contains: keyword, mode: 'insensitive' } },
                    ],
                  },
                },
              ],
            }
          : {}),
      },
      select: reminderSelect,
      orderBy: [{ isSent: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const reminder = await this.prisma.maintenanceReminder.findUnique({
      where: { id },
      select: reminderSelect,
    });
    if (!reminder) throw new NotFoundException(`Reminder ${id} not found`);
    return reminder;
  }

  async create(dto: CreateReminderDto) {
    await this.assertCustomerVehicle(dto.customerId, dto.vehicleId);

    return this.prisma.maintenanceReminder.create({
      data: {
        customerId: dto.customerId,
        vehicleId: dto.vehicleId,
        message: dto.message,
        dueDate: dto.dueDate,
      },
      select: reminderSelect,
    });
  }

  async update(id: string, dto: UpdateReminderDto) {
    const current = await this.findById(id);
    const customerId = dto.customerId ?? current.customerId;
    const vehicleId = dto.vehicleId ?? current.vehicleId;
    await this.assertCustomerVehicle(customerId, vehicleId);

    return this.prisma.maintenanceReminder.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        vehicleId: dto.vehicleId,
        message: dto.message === undefined ? undefined : dto.message || current.message,
        dueDate: dto.dueDate,
        isSent: dto.isSent,
        sentAt:
          dto.isSent === undefined
            ? undefined
            : dto.isSent
              ? (current.sentAt ?? new Date())
              : null,
      },
      select: reminderSelect,
    });
  }

  async markSent(id: string) {
    await this.findById(id);
    return this.prisma.maintenanceReminder.update({
      where: { id },
      data: {
        isSent: true,
        sentAt: new Date(),
      },
      select: reminderSelect,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.maintenanceReminder.delete({ where: { id } });
    return { id };
  }

  private async assertCustomerVehicle(customerId: string, vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, customerId: true },
    });
    if (!vehicle) throw new NotFoundException(`Vehicle ${vehicleId} not found`);
    if (vehicle.customerId !== customerId) {
      throw new BadRequestException('Vehicle does not belong to selected customer');
    }
  }
}
