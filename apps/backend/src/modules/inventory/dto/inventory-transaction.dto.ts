import { z } from 'zod';

const baseTransactionSchema = z.object({
  partId: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
  referenceId: z.string().uuid().optional().nullable(),
  note: z.string().trim().min(1).max(1000).optional().nullable(),
});

export const CreateInventoryMovementSchema = baseTransactionSchema;

export type CreateInventoryMovementDto = z.infer<typeof CreateInventoryMovementSchema>;

export const CreateInventoryAdjustmentSchema = z.object({
  partId: z.string().uuid(),
  quantityDelta: z.coerce.number().int().refine((value) => value !== 0, {
    message: 'quantityDelta must not be zero',
  }),
  referenceId: z.string().uuid().optional().nullable(),
  note: z.string().trim().min(1).max(1000),
});

export type CreateInventoryAdjustmentDto = z.infer<typeof CreateInventoryAdjustmentSchema>;

export const InventoryTransactionQuerySchema = z
  .object({
    partId: z.string().uuid().optional(),
    type: z.enum(['Import', 'Export', 'Adjustment']).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    message: 'from must be before or equal to to',
    path: ['from'],
  });

export type InventoryTransactionQueryDto = z.infer<typeof InventoryTransactionQuerySchema>;
