import { z } from 'zod';

const DateRangeBaseSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const DateRangeQuerySchema = DateRangeBaseSchema.refine(
  (value) => !value.from || !value.to || value.from <= value.to,
  {
    message: 'from must be before or equal to to',
    path: ['from'],
  },
);

export type DateRangeQueryDto = z.infer<typeof DateRangeQuerySchema>;

export const TopQuerySchema = DateRangeBaseSchema.extend({
  limit: z.coerce.number().int().min(1).max(20).default(5),
}).refine((value) => !value.from || !value.to || value.from <= value.to, {
  message: 'from must be before or equal to to',
  path: ['from'],
});

export type TopQueryDto = z.infer<typeof TopQuerySchema>;
