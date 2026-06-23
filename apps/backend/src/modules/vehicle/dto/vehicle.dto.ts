import { z } from 'zod';

const currentYear = new Date().getFullYear() + 1;

export const CreateVehicleSchema = z.object({
  customerId: z.string().uuid(),
  licensePlate: z.string().trim().min(1).max(20),
  make: z.string().trim().min(1).max(50),
  model: z.string().trim().min(1).max(50),
  year: z.coerce.number().int().min(1900).max(currentYear),
  color: z.string().trim().max(30).optional().nullable(),
  vin: z.string().trim().min(1).max(17).optional().nullable(),
  mileage: z.coerce.number().int().min(0).optional().nullable(),
});

export type CreateVehicleDto = z.infer<typeof CreateVehicleSchema>;

export const UpdateVehicleSchema = CreateVehicleSchema.partial();

export type UpdateVehicleDto = z.infer<typeof UpdateVehicleSchema>;

export const VehicleQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  customerId: z.string().uuid().optional(),
});

export type VehicleQueryDto = z.infer<typeof VehicleQuerySchema>;

