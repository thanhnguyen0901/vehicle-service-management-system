import api from '../../services/api';

export interface Part {
  id: string;
  partNumber: string;
  name: string;
  description: string | null;
  unit: string;
  unitCost: string;
  unitPrice: string;
  stockQuantity: number;
  reorderLevel: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartInput {
  partNumber: string;
  name: string;
  description?: string | null;
  unit: string;
  unitCost: number;
  unitPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  isActive?: boolean;
}

export interface PartListParams {
  search?: string;
  isActive?: boolean;
  lowStock?: boolean;
}

export const partApi = {
  list: (params: PartListParams = {}): Promise<Part[]> =>
    api.get<Part[]>('/parts', { params }).then((r) => r.data),

  create: (data: PartInput): Promise<Part> =>
    api.post<Part>('/parts', data).then((r) => r.data),

  update: (id: string, data: Partial<PartInput>): Promise<Part> =>
    api.patch<Part>(`/parts/${id}`, data).then((r) => r.data),

  toggle: (id: string, isActive: boolean): Promise<Part> =>
    api.patch<Part>(`/parts/${id}/toggle`, { isActive }).then((r) => r.data),

  deactivate: (id: string): Promise<{ id: string; isActive: boolean }> =>
    api.delete<{ id: string; isActive: boolean }>(`/parts/${id}`).then((r) => r.data),
};

