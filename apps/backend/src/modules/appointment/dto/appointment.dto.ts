import { AppointmentStatus } from '@prisma/client';
import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();
const dateTimeString = z
  .string()
  .trim()
  .datetime({ offset: true })
  .or(z.string().trim().datetime({ local: true }));

export const CreateAppointmentSchema = z.object({
  vehicleId: z.string().uuid(),
  scheduledAt: dateTimeString,
  serviceNote: optionalText(1000),
});

export type CreateAppointmentDto = z.infer<typeof CreateAppointmentSchema>;

export const UpdateAppointmentSchema = z
  .object({
    vehicleId: z.string().uuid().optional(),
    scheduledAt: dateTimeString.optional(),
    serviceNote: optionalText(1000),
    status: z.nativeEnum(AppointmentStatus).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export type UpdateAppointmentDto = z.infer<typeof UpdateAppointmentSchema>;

export const AppointmentQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  from: dateTimeString.optional(),
  to: dateTimeString.optional(),
});

export type AppointmentQueryDto = z.infer<typeof AppointmentQuerySchema>;
