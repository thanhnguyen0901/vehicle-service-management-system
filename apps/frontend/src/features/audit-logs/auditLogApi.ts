import api from '../../services/api';

export interface AuditLogUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  before: unknown;
  after: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: AuditLogUser | null;
}

export interface AuditLogListParams {
  search?: string;
  action?: string;
  entity?: string;
  userId?: string;
  from?: string;
  to?: string;
  take?: number;
}

export const auditLogApi = {
  list: (params: AuditLogListParams = {}): Promise<AuditLog[]> =>
    api.get<AuditLog[]>('/audit-logs', { params }).then((response) => response.data),
};
