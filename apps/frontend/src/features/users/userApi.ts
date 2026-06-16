import api from '../../services/api';

export const USER_ROLES = [
  'Admin',
  'ServiceAdvisor',
  'Technician',
  'InventoryClerk',
  'Cashier',
  'Manager',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string | null;
  phone?: string | null;
  role?: UserRole;
  isActive?: boolean;
}

export const userApi = {
  list: (): Promise<UserAccount[]> => api.get<UserAccount[]>('/users').then((r) => r.data),

  create: (data: CreateUserRequest): Promise<UserAccount> =>
    api.post<UserAccount>('/users', data).then((r) => r.data),

  update: (id: string, data: UpdateUserRequest): Promise<UserAccount> =>
    api.patch<UserAccount>(`/users/${id}`, data).then((r) => r.data),

  deactivate: (id: string): Promise<{ id: string; isActive: boolean }> =>
    api.delete<{ id: string; isActive: boolean }>(`/users/${id}`).then((r) => r.data),
};
