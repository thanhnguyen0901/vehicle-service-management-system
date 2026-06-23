import api from '../../services/api';
import type { Customer } from '../customers/customerApi';

export interface Vehicle {
  id: string;
  customerId: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  vin: string | null;
  mileage: number | null;
  createdAt: string;
  updatedAt: string;
  customer: Pick<Customer, 'id' | 'fullName' | 'phone' | 'type' | 'companyName'>;
}

export interface VehicleInput {
  customerId: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color?: string | null;
  vin?: string | null;
  mileage?: number | null;
}

export interface VehicleListParams {
  search?: string;
  customerId?: string;
}

export const vehicleApi = {
  list: (params: VehicleListParams = {}): Promise<Vehicle[]> =>
    api.get<Vehicle[]>('/vehicles', { params }).then((r) => r.data),

  create: (data: VehicleInput): Promise<Vehicle> =>
    api.post<Vehicle>('/vehicles', data).then((r) => r.data),

  update: (id: string, data: Partial<VehicleInput>): Promise<Vehicle> =>
    api.patch<Vehicle>(`/vehicles/${id}`, data).then((r) => r.data),

  delete: (id: string): Promise<{ id: string }> =>
    api.delete<{ id: string }>(`/vehicles/${id}`).then((r) => r.data),
};

