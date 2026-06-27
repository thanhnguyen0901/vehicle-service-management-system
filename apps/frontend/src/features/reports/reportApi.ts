import api from '../../services/api';
import type { WorkOrderStatus } from '../work-orders/workOrderApi';

export interface DateRangeParams {
  from?: string;
  to?: string;
}

export interface TopParams extends DateRangeParams {
  limit?: number;
}

export interface RevenueReport {
  totalRevenue: number;
  paymentCount: number;
  series: Array<{
    date: string;
    amount: number;
  }>;
}

export interface WorkOrderReport {
  total: number;
  counts: Array<{
    status: WorkOrderStatus;
    count: number;
  }>;
}

export interface TopServiceReportRow {
  serviceId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface TopPartReportRow {
  partId: string;
  partNumber: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface LowStockReportRow {
  id: string;
  partNumber: string;
  name: string;
  unit: string;
  stockQuantity: number;
  reorderLevel: number;
}

export const reportApi = {
  revenue: (params: DateRangeParams = {}): Promise<RevenueReport> =>
    api.get<RevenueReport>('/reports/revenue', { params }).then((response) => response.data),

  workOrders: (params: DateRangeParams = {}): Promise<WorkOrderReport> =>
    api.get<WorkOrderReport>('/reports/work-orders', { params }).then((response) => response.data),

  topServices: (params: TopParams = {}): Promise<TopServiceReportRow[]> =>
    api.get<TopServiceReportRow[]>('/reports/top-services', { params }).then((response) => response.data),

  topParts: (params: TopParams = {}): Promise<TopPartReportRow[]> =>
    api.get<TopPartReportRow[]>('/reports/top-parts', { params }).then((response) => response.data),

  lowStock: (): Promise<LowStockReportRow[]> =>
    api.get<LowStockReportRow[]>('/reports/low-stock').then((response) => response.data),
};
