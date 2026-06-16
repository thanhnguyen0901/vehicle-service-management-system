import api from '../../services/api';
import type { AuthUser } from './authSlice';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
}

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    api.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  logout: (): Promise<void> =>
    api.post('/auth/logout').then(() => undefined),

  me: (): Promise<LoginResponse> =>
    api.post<LoginResponse>('/auth/me').then((r) => r.data),

  refresh: (): Promise<void> =>
    api.post('/auth/refresh').then(() => undefined),
};
