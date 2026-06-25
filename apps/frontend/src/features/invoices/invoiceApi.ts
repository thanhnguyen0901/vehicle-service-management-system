import api from '../../services/api';
import type { WorkOrderStatus } from '../work-orders/workOrderApi';

export type InvoiceStatus = 'Unpaid' | 'Paid';

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
  amount: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  workOrderId: string;
  status: InvoiceStatus;
  totalAmount: string;
  discount: string;
  tax: string;
  notes: string | null;
  issuedAt: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  workOrder: {
    id: string;
    status: WorkOrderStatus;
    receivedAt: string;
    vehicle: {
      id: string;
      licensePlate: string;
      make: string;
      model: string;
      customer: {
        id: string;
        fullName: string;
        phone: string;
        type: 'Individual' | 'Corporate';
        companyName: string | null;
        taxCode: string | null;
        address: string | null;
      };
    };
  };
  lines: InvoiceLine[];
}

export interface CreateInvoiceInput {
  workOrderId: string;
  discount: number;
  tax: number;
  notes?: string | null;
}

export interface InvoiceListParams {
  search?: string;
  status?: InvoiceStatus;
  from?: string;
  to?: string;
}

export const invoiceApi = {
  list: (params: InvoiceListParams = {}): Promise<Invoice[]> =>
    api.get<Invoice[]>('/invoices', { params }).then((response) => response.data),

  get: (id: string): Promise<Invoice> =>
    api.get<Invoice>(`/invoices/${id}`).then((response) => response.data),

  create: (data: CreateInvoiceInput): Promise<Invoice> =>
    api.post<Invoice>('/invoices', data).then((response) => response.data),
};
