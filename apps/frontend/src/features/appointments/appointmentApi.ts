import api from '../../services/api';
import type { Vehicle } from '../vehicles/vehicleApi';

export const APPOINTMENT_STATUSES = ['Scheduled', 'Arrived', 'Cancelled'] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export interface Appointment {
  id: string;
  vehicleId: string;
  scheduledAt: string;
  serviceNote: string | null;
  status: AppointmentStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle: Pick<Vehicle, 'id' | 'licensePlate' | 'make' | 'model' | 'customer'>;
  workOrder: {
    id: string;
    status: string;
  } | null;
}

export interface AppointmentInput {
  vehicleId: string;
  scheduledAt: string;
  serviceNote?: string | null;
  status?: AppointmentStatus;
}

export interface AppointmentListParams {
  search?: string;
  status?: AppointmentStatus;
  from?: string;
  to?: string;
}

export const appointmentApi = {
  list: (params: AppointmentListParams = {}): Promise<Appointment[]> =>
    api.get<Appointment[]>('/appointments', { params }).then((r) => r.data),

  create: (data: AppointmentInput): Promise<Appointment> =>
    api.post<Appointment>('/appointments', data).then((r) => r.data),

  update: (id: string, data: Partial<AppointmentInput>): Promise<Appointment> =>
    api.patch<Appointment>(`/appointments/${id}`, data).then((r) => r.data),

  delete: (id: string): Promise<{ id: string }> =>
    api.delete<{ id: string }>(`/appointments/${id}`).then((r) => r.data),
};
