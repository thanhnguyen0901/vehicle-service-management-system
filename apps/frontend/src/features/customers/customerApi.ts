import api from '../../services/api';

export const CUSTOMER_TYPES = ['Individual', 'Corporate'] as const;

export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  type: CustomerType;
  companyName: string | null;
  taxCode: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    vehicles: number;
  };
}

export interface CustomerInput {
  fullName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  type: CustomerType;
  companyName?: string | null;
  taxCode?: string | null;
  notes?: string | null;
}

export interface CustomerListParams {
  search?: string;
  type?: CustomerType;
}

export const customerApi = {
  list: (params: CustomerListParams = {}): Promise<Customer[]> =>
    api.get<Customer[]>('/customers', { params }).then((r) => r.data),

  create: (data: CustomerInput): Promise<Customer> =>
    api.post<Customer>('/customers', data).then((r) => r.data),

  update: (id: string, data: Partial<CustomerInput>): Promise<Customer> =>
    api.patch<Customer>(`/customers/${id}`, data).then((r) => r.data),

  delete: (id: string): Promise<{ id: string }> =>
    api.delete<{ id: string }>(`/customers/${id}`).then((r) => r.data),
};

