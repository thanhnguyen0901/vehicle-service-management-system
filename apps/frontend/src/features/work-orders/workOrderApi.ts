import api from '../../services/api';
import type { Appointment } from '../appointments/appointmentApi';
import type { RepairService } from '../services/serviceCatalogApi';
import type { Vehicle } from '../vehicles/vehicleApi';

export const WORK_ORDER_STATUSES = [
  'Received',
  'Diagnosing',
  'Repairing',
  'WaitingParts',
  'ReadyForDelivery',
  'Delivered',
  'Cancelled',
] as const;

export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

export interface WorkOrderItem {
  id: string;
  serviceId: string | null;
  description: string;
  quantity: number;
  unitPrice: string;
  amount: string;
  createdAt: string;
  updatedAt: string;
  service: Pick<RepairService, 'id' | 'name'> | null;
}

export interface WorkOrder {
  id: string;
  vehicleId: string;
  appointmentId: string | null;
  status: WorkOrderStatus;
  diagnosis: string | null;
  technicianId: string | null;
  advisorId: string | null;
  receivedAt: string;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle: Pick<Vehicle, 'id' | 'licensePlate' | 'make' | 'model' | 'customer'>;
  appointment: Pick<Appointment, 'id' | 'scheduledAt' | 'status' | 'serviceNote'> | null;
  items: WorkOrderItem[];
}

export interface WorkOrderInput {
  vehicleId?: string;
  appointmentId?: string;
  diagnosis?: string | null;
}

export interface WorkOrderItemInput {
  serviceId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface WorkOrderListParams {
  search?: string;
  status?: WorkOrderStatus;
  vehicleId?: string;
}

export const workOrderApi = {
  list: (params: WorkOrderListParams = {}): Promise<WorkOrder[]> =>
    api.get<WorkOrder[]>('/work-orders', { params }).then((r) => r.data),

  get: (id: string): Promise<WorkOrder> =>
    api.get<WorkOrder>(`/work-orders/${id}`).then((r) => r.data),

  create: (data: WorkOrderInput): Promise<WorkOrder> =>
    api.post<WorkOrder>('/work-orders', data).then((r) => r.data),

  updateStatus: (id: string, status: WorkOrderStatus, diagnosis?: string | null): Promise<WorkOrder> =>
    api.patch<WorkOrder>(`/work-orders/${id}/status`, { status, diagnosis }).then((r) => r.data),

  addItem: (id: string, data: WorkOrderItemInput): Promise<WorkOrderItem> =>
    api.post<WorkOrderItem>(`/work-orders/${id}/items`, data).then((r) => r.data),

  updateItem: (id: string, itemId: string, data: Partial<WorkOrderItemInput>): Promise<WorkOrderItem> =>
    api.patch<WorkOrderItem>(`/work-orders/${id}/items/${itemId}`, data).then((r) => r.data),

  deleteItem: (id: string, itemId: string): Promise<{ id: string }> =>
    api.delete<{ id: string }>(`/work-orders/${id}/items/${itemId}`).then((r) => r.data),
};
