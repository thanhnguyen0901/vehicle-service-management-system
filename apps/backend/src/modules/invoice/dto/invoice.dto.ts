import { InvoiceStatus, PaymentMethod } from '@prisma/client';
import { z } from 'zod';

export const CreateInvoiceSchema = z.object({
  workOrderId: z.string().uuid(),
  discount: z.coerce.number().min(0).default(0),
  tax: z.coerce.number().min(0).default(0),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>;

export const InvoiceQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    status: z.nativeEnum(InvoiceStatus).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    message: 'from must be before or equal to to',
    path: ['from'],
  });

export type InvoiceQueryDto = z.infer<typeof InvoiceQuerySchema>;

export const CreatePaymentSchema = z.object({
  amount: z.coerce.number().positive(),
  method: z.nativeEnum(PaymentMethod),
  transactionRef: z.string().trim().max(100).optional().nullable(),
});

export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
