import { z } from 'zod';

export const AuditLogQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    action: z.string().trim().max(100).optional(),
    entity: z.string().trim().max(50).optional(),
    userId: z.string().uuid().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    take: z.coerce.number().int().min(1).max(100).default(50),
  })
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    message: 'from must be before or equal to to',
    path: ['from'],
  });

export type AuditLogQueryDto = z.infer<typeof AuditLogQuerySchema>;
