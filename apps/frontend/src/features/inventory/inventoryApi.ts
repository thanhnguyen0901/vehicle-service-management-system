import api from '../../services/api';

export type InventoryTransactionType = 'Import' | 'Export' | 'Adjustment';

export interface InventoryTransaction {
  id: string;
  type: InventoryTransactionType;
  quantityDelta: number;
  referenceId: string | null;
  note: string | null;
  performedBy: string | null;
  createdAt: string;
  part: {
    id: string;
    partNumber: string;
    name: string;
    unit: string;
    stockQuantity: number;
  };
}

export interface InventoryTransactionParams {
  partId?: string;
  type?: InventoryTransactionType;
  from?: string;
  to?: string;
}

interface InventoryMovementInput {
  partId: string;
  quantity: number;
  referenceId?: string | null;
  note?: string | null;
}

interface InventoryAdjustmentInput {
  partId: string;
  quantityDelta: number;
  referenceId?: string | null;
  note: string;
}

export const inventoryApi = {
  list: (params: InventoryTransactionParams = {}): Promise<InventoryTransaction[]> =>
    api.get<InventoryTransaction[]>('/inventory/transactions', { params }).then((response) => response.data),

  importStock: (data: InventoryMovementInput): Promise<InventoryTransaction> =>
    api.post<InventoryTransaction>('/inventory/import', data).then((response) => response.data),

  exportStock: (data: InventoryMovementInput): Promise<InventoryTransaction> =>
    api.post<InventoryTransaction>('/inventory/export', data).then((response) => response.data),

  adjustStock: (data: InventoryAdjustmentInput): Promise<InventoryTransaction> =>
    api.post<InventoryTransaction>('/inventory/adjustment', data).then((response) => response.data),
};
