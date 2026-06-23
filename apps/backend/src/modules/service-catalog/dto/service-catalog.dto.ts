import { z } from 'zod';

export const CreateServiceSchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(1000).optional().nullable(),
  unitPrice: z.coerce.number().min(0),
  durationMin: z.coerce.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
});

export type CreateServiceDto = z.infer<typeof CreateServiceSchema>;

export const UpdateServiceSchema = CreateServiceSchema.partial();

export type UpdateServiceDto = z.infer<typeof UpdateServiceSchema>;

export const ServiceQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
});

export type ServiceQueryDto = z.infer<typeof ServiceQuerySchema>;

export const ToggleServiceSchema = z.object({
  isActive: z.boolean(),
});

export type ToggleServiceDto = z.infer<typeof ToggleServiceSchema>;

