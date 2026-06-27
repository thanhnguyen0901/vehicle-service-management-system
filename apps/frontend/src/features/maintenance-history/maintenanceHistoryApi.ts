import api from '../../services/api';
import type { Customer } from '../customers/customerApi';
import type { PaymentMethod } from '../invoices/invoiceApi';
import type { WorkOrderStatus } from '../work-orders/workOrderApi';

export interface MaintenanceHistoryPartUsage {
  id: string;
  quantity: number;
  unitPrice: string;
  createdAt: string;
  part: {
    id: string;
    partNumber: string;
    name: string;
    unit: string;
  };
}

export interface MaintenanceHistoryItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
  amount: string;
  service: {
    id: string;
    name: string;
  } | null;
  partUsages: MaintenanceHistoryPartUsage[];
}

export interface MaintenanceHistoryPayment {
  id: string;
  amount: string;
  method: PaymentMethod;
  transactionRef: string | null;
  paidAt: string;
}

export interface MaintenanceHistoryInvoice {
  id: string;
  status: 'Unpaid' | 'Paid';
  totalAmount: string;
  discount: string;
  tax: string;
  issuedAt: string;
  paidAt: string | null;
  payments: MaintenanceHistoryPayment[];
}

export interface MaintenanceHistoryEntry {
  id: string;
  status: WorkOrderStatus;
  diagnosis: string | null;
  receivedAt: string;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle: {
    id: string;
    licensePlate: string;
    make: string;
    model: string;
    year: number;
    mileage: number | null;
    customer: Pick<Customer, 'id' | 'fullName' | 'phone' | 'type' | 'companyName'>;
  };
  items: MaintenanceHistoryItem[];
  invoice: MaintenanceHistoryInvoice | null;
}

export interface MaintenanceHistoryParams {
  vehicleId?: string;
  customerId?: string;
  search?: string;
}

export const maintenanceHistoryApi = {
  list: (params: MaintenanceHistoryParams = {}): Promise<MaintenanceHistoryEntry[]> =>
    api.get<MaintenanceHistoryEntry[]>('/maintenance-history', { params }).then((response) => response.data),
};
