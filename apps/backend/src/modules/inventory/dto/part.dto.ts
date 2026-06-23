import { z } from 'zod';

export const CreatePartSchema = z.object({
  partNumber: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(1000).optional().nullable(),
  unit: z.string().trim().min(1).max(30).default('piece'),
  unitCost: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  reorderLevel: z.coerce.number().int().min(0).default(5),
  isActive: z.boolean().optional(),
});

export type CreatePartDto = z.infer<typeof CreatePartSchema>;

export const UpdatePartSchema = CreatePartSchema.partial();

export type UpdatePartDto = z.infer<typeof UpdatePartSchema>;

export const PartQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  lowStock: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export type PartQueryDto = z.infer<typeof PartQuerySchema>;

export const TogglePartSchema = z.object({
  isActive: z.boolean(),
});

export type TogglePartDto = z.infer<typeof TogglePartSchema>;
