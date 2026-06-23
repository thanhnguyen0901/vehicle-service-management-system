import api from '../../services/api';

export interface RepairService {
  id: string;
  name: string;
  description: string | null;
  unitPrice: string;
  durationMin: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceInput {
  name: string;
  description?: string | null;
  unitPrice: number;
  durationMin?: number | null;
  isActive?: boolean;
}

export const serviceCatalogApi = {
  list: (): Promise<RepairService[]> => api.get<RepairService[]>('/services').then((r) => r.data),

  create: (data: ServiceInput): Promise<RepairService> =>
    api.post<RepairService>('/services', data).then((r) => r.data),

  update: (id: string, data: Partial<ServiceInput>): Promise<RepairService> =>
    api.patch<RepairService>(`/services/${id}`, data).then((r) => r.data),

  toggle: (id: string, isActive: boolean): Promise<RepairService> =>
    api.patch<RepairService>(`/services/${id}/toggle`, { isActive }).then((r) => r.data),
};

