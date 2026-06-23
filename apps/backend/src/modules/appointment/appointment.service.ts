import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AppointmentQueryDto, CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';

const appointmentSelect = {
  id: true,
  vehicleId: true,
  scheduledAt: true,
  serviceNote: true,
  status: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  vehicle: {
    select: {
      id: true,
      licensePlate: true,
      make: true,
      model: true,
      customer: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          type: true,
          companyName: true,
        },
      },
    },
  },
  workOrder: {
    select: {
      id: true,
      status: true,
    },
  },
} satisfies Prisma.AppointmentSelect;

@Injectable()
export class AppointmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AppointmentQueryDto = {}) {
    const keyword = query.search?.trim();

    return this.prisma.appointment.findMany({
      where: {
        status: query.status,
        scheduledAt: {
          ...(query.from ? { gte: new Date(query.from) } : {}),
          ...(query.to ? { lte: new Date(query.to) } : {}),
        },
        ...(keyword
          ? {
              OR: [
                { serviceNote: { contains: keyword, mode: 'insensitive' } },
                {
                  vehicle: {
                    OR: [
                      { licensePlate: { contains: keyword, mode: 'insensitive' } },
                      { make: { contains: keyword, mode: 'insensitive' } },
                      { model: { contains: keyword, mode: 'insensitive' } },
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
                  },
                },
              ],
            }
          : {}),
      },
      select: appointmentSelect,
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findById(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      select: appointmentSelect,
    });
    if (!appointment) throw new NotFoundException(`Appointment ${id} not found`);
    return appointment;
  }

  async create(dto: CreateAppointmentDto, createdBy?: string) {
    await this.assertVehicleExists(dto.vehicleId);

    return this.prisma.appointment.create({
      data: {
        vehicleId: dto.vehicleId,
        scheduledAt: new Date(dto.scheduledAt),
        serviceNote: dto.serviceNote || null,
        createdBy: createdBy ?? null,
      },
      select: appointmentSelect,
    });
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    const appointment = await this.findById(id);
    if (appointment.status === AppointmentStatus.Cancelled) {
      throw new ConflictException('Cancelled appointments cannot be updated');
    }
    if (dto.vehicleId) await this.assertVehicleExists(dto.vehicleId);
    if (dto.status && !this.isAllowedStatusChange(appointment.status, dto.status)) {
      throw new BadRequestException(`Cannot change appointment status from ${appointment.status} to ${dto.status}`);
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        vehicleId: dto.vehicleId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        serviceNote: dto.serviceNote === undefined ? undefined : dto.serviceNote || null,
        status: dto.status,
      },
      select: appointmentSelect,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.appointment.delete({ where: { id } });
    return { id };
  }

  private async assertVehicleExists(vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true },
    });
    if (!vehicle) throw new NotFoundException(`Vehicle ${vehicleId} not found`);
  }

  private isAllowedStatusChange(current: AppointmentStatus, next: AppointmentStatus) {
    if (current === next) return true;
    if (current === AppointmentStatus.Scheduled) {
      return next === AppointmentStatus.Arrived || next === AppointmentStatus.Cancelled;
    }
    return false;
  }
}
