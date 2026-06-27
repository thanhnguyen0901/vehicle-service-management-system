import api from '../../services/api';
import type { Customer } from '../customers/customerApi';
import type { Vehicle } from '../vehicles/vehicleApi';

export interface Reminder {
  id: string;
  customerId: string;
  vehicleId: string;
  message: string;
  dueDate: string;
  sentAt: string | null;
  isSent: boolean;
  createdAt: string;
  updatedAt: string;
  customer: Pick<Customer, 'id' | 'fullName' | 'phone' | 'type' | 'companyName'>;
  vehicle: Pick<Vehicle, 'id' | 'licensePlate' | 'make' | 'model' | 'year'>;
}

export interface ReminderInput {
  customerId: string;
  vehicleId: string;
  message: string;
  dueDate: string;
}

export interface ReminderListParams {
  search?: string;
  customerId?: string;
  vehicleId?: string;
  isSent?: boolean;
  dueFrom?: string;
  dueTo?: string;
}

export const reminderApi = {
  list: (params: ReminderListParams = {}): Promise<Reminder[]> =>
    api.get<Reminder[]>('/reminders', { params }).then((response) => response.data),

  create: (data: ReminderInput): Promise<Reminder> =>
    api.post<Reminder>('/reminders', data).then((response) => response.data),

  update: (id: string, data: Partial<ReminderInput>): Promise<Reminder> =>
    api.patch<Reminder>(`/reminders/${id}`, data).then((response) => response.data),

  markSent: (id: string): Promise<Reminder> =>
    api.patch<Reminder>(`/reminders/${id}/send`).then((response) => response.data),

  delete: (id: string): Promise<{ id: string }> =>
    api.delete<{ id: string }>(`/reminders/${id}`).then((response) => response.data),
};
