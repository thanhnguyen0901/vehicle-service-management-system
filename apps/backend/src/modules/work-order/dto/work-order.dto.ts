import { WorkOrderStatus } from '@prisma/client';
import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();

export const CreateWorkOrderSchema = z
  .object({
    vehicleId: z.string().uuid().optional(),
    appointmentId: z.string().uuid().optional(),
    diagnosis: optionalText(2000),
    technicianId: z.string().uuid().optional().nullable(),
  })
  .refine((value) => value.vehicleId || value.appointmentId, {
    message: 'vehicleId or appointmentId is required',
  });

export type CreateWorkOrderDto = z.infer<typeof CreateWorkOrderSchema>;

export const WorkOrderQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.nativeEnum(WorkOrderStatus).optional(),
  vehicleId: z.string().uuid().optional(),
});

export type WorkOrderQueryDto = z.infer<typeof WorkOrderQuerySchema>;

export const UpdateWorkOrderStatusSchema = z.object({
  status: z.nativeEnum(WorkOrderStatus),
  diagnosis: optionalText(2000),
});

export type UpdateWorkOrderStatusDto = z.infer<typeof UpdateWorkOrderStatusSchema>;

export const CreateWorkOrderItemSchema = z.object({
  serviceId: z.string().uuid().optional().nullable(),
  description: z.string().trim().min(1).max(255),
  quantity: z.coerce.number().int().min(1).default(1),
  unitPrice: z.coerce.number().min(0),
});

export type CreateWorkOrderItemDto = z.infer<typeof CreateWorkOrderItemSchema>;

export const UpdateWorkOrderItemSchema = CreateWorkOrderItemSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: 'At least one field is required',
  },
);

export type UpdateWorkOrderItemDto = z.infer<typeof UpdateWorkOrderItemSchema>;
