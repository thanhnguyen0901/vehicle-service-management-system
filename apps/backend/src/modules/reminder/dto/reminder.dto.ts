import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();

export const CreateReminderSchema = z.object({
  customerId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  message: z.string().trim().min(1).max(1000),
  dueDate: z.coerce.date(),
});

export type CreateReminderDto = z.infer<typeof CreateReminderSchema>;

export const UpdateReminderSchema = z.object({
  customerId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  message: optionalText(1000),
  dueDate: z.coerce.date().optional(),
  isSent: z.coerce.boolean().optional(),
});

export type UpdateReminderDto = z.infer<typeof UpdateReminderSchema>;

export const ReminderQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  customerId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  isSent: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  dueFrom: z.coerce.date().optional(),
  dueTo: z.coerce.date().optional(),
});

export type ReminderQueryDto = z.infer<typeof ReminderQuerySchema>;
