import { z } from 'zod';
import { CustomerType } from '@prisma/client';

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();

const CustomerBaseSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(1).max(20),
  email: z.string().trim().email().optional().nullable(),
  address: optionalText(500),
  type: z.nativeEnum(CustomerType).default(CustomerType.Individual),
  companyName: optionalText(150),
  taxCode: optionalText(20),
  notes: optionalText(1000),
});

export const CreateCustomerSchema = CustomerBaseSchema
  .superRefine((value, ctx) => {
    if (value.type === CustomerType.Corporate && !value.companyName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['companyName'],
        message: 'Company name is required for corporate customers',
      });
    }
  });

export type CreateCustomerDto = z.infer<typeof CreateCustomerSchema>;

export const UpdateCustomerSchema = CustomerBaseSchema.partial().superRefine((value, ctx) => {
  if (value.type === CustomerType.Corporate && value.companyName !== undefined && !value.companyName?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['companyName'],
      message: 'Company name is required for corporate customers',
    });
  }
});

export type UpdateCustomerDto = z.infer<typeof UpdateCustomerSchema>;

export const CustomerQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  type: z.nativeEnum(CustomerType).optional(),
});

export type CustomerQueryDto = z.infer<typeof CustomerQuerySchema>;
