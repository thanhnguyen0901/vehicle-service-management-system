import { z } from 'zod';

export const MaintenanceHistoryQuerySchema = z.object({
  vehicleId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  search: z.string().trim().max(100).optional(),
});

export type MaintenanceHistoryQueryDto = z.infer<typeof MaintenanceHistoryQuerySchema>;
