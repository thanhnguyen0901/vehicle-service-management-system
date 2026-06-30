import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { selectCurrentUser } from '../auth/authSlice';
import { partApi, type Part } from '../parts/partApi';
import {
  inventoryApi,
  type InventoryTransaction,
  type InventoryTransactionType,
} from './inventoryApi';

type TransactionMode = 'import' | 'export' | 'adjustment';

interface TransactionForm {
  partId: string;
  quantity: number;
  note: string;
}

const emptyForm: TransactionForm = {
  partId: '',
  quantity: 1,
  note: '',
};

const typeLabels: Record<InventoryTransactionType, string> = {
  Import: 'Nhập kho',
  Export: 'Xuất kho',
  Adjustment: 'Điều chỉnh',
};

const modeLabels: Record<TransactionMode, string> = {
  import: 'Nhập kho',
  export: 'Xuất kho',
  adjustment: 'Điều chỉnh tồn',
};

export function InventoryTransactionsPage() {
  const currentUser = useSelector(selectCurrentUser);
  const [parts, setParts] = useState<Part[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [partFilter, setPartFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dialogMode, setDialogMode] = useState<TransactionMode | null>(null);
  const [form, setForm] = useState<TransactionForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canWrite = currentUser?.role === 'Admin' || currentUser?.role === 'InventoryClerk';
  const activeParts = useMemo(() => parts.filter((part) => part.isActive), [parts]);
  const selectedPart = parts.find((part) => part.id === form.partId);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [partList, transactionList] = await Promise.all([
        partApi.list(),
        inventoryApi.list({
          partId: partFilter || undefined,
          type: (typeFilter || undefined) as InventoryTransactionType | undefined,
        }),
      ]);
      setParts(partList);
      setTransactions(transactionList);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được dữ liệu giao dịch kho'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [partFilter, typeFilter]);

  const openDialog = (mode: TransactionMode) => {
    setForm({ ...emptyForm, partId: activeParts[0]?.id ?? '' });
    setDialogMode(mode);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dialogMode) return;

    setIsSaving(true);
    setError(null);
    try {
      if (dialogMode === 'import') {
        await inventoryApi.importStock({
          partId: form.partId,
          quantity: form.quantity,
          note: form.note || null,
        });
      } else if (dialogMode === 'export') {
        await inventoryApi.exportStock({
          partId: form.partId,
          quantity: form.quantity,
          note: form.note || null,
        });
      } else {
        await inventoryApi.adjustStock({
          partId: form.partId,
          quantityDelta: form.quantity,
          note: form.note,
        });
      }
      setDialogMode(null);
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không ghi nhận được giao dịch kho'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Giao dịch kho</h1>
          <p className="text-sm text-gray-500">Theo dõi nhập, xuất và điều chỉnh tồn kho phụ tùng.</p>
        </div>
        <div className="page-actions">
          <Button
            label="Nhập kho"
            icon="pi pi-download"
            className="page-create-button"
            onClick={() => openDialog('import')}
            disabled={!canWrite || activeParts.length === 0}
          />
          <Button
            label="Xuất kho"
            icon="pi pi-upload"
            severity="warning"
            className="page-create-button"
            onClick={() => openDialog('export')}
            disabled={!canWrite || activeParts.length === 0}
          />
          <Button
            label="Điều chỉnh"
            icon="pi pi-sliders-h"
            severity="secondary"
            className="page-create-button"
            onClick={() => openDialog('adjustment')}
            disabled={!canWrite || activeParts.length === 0}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Message severity="error" text={error} />
        </div>
      )}

      <div className="filter-panel sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Lọc theo phụ tùng
          <select
            className="p-inputtext w-full"
            value={partFilter}
            onChange={(event) => setPartFilter(event.target.value)}
          >
            <option value="">Tất cả phụ tùng</option>
            {parts.map((part) => (
              <option key={part.id} value={part.id}>
                {part.partNumber} - {part.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Lọc theo loại
          <select
            className="p-inputtext w-full"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="">Tất cả loại</option>
            <option value="Import">Nhập kho</option>
            <option value="Export">Xuất kho</option>
            <option value="Adjustment">Điều chỉnh</option>
          </select>
        </label>
      </div>

      <div className="page-table-surface">
        <DataTable
          value={transactions}
          loading={isLoading}
          dataKey="id"
          paginator
          rows={10}
          emptyMessage="Chưa có giao dịch kho phù hợp"
          tableStyle={{ minWidth: '64rem' }}
        >
          <Column
            header="Thời gian"
            body={(row: InventoryTransaction) => new Date(row.createdAt).toLocaleString('vi-VN')}
            sortable
          />
          <Column field="part.partNumber" header="Mã phụ tùng" sortable />
          <Column field="part.name" header="Tên phụ tùng" sortable />
          <Column
            header="Loại"
            body={(row: InventoryTransaction) => (
              <Tag
                value={typeLabels[row.type]}
                severity={row.type === 'Import' ? 'success' : row.type === 'Export' ? 'warning' : 'info'}
              />
            )}
          />
          <Column
            header="Thay đổi"
            body={(row: InventoryTransaction) => (
              <span className={row.quantityDelta > 0 ? 'font-semibold text-green-600' : 'font-semibold text-red-600'}>
                {row.quantityDelta > 0 ? '+' : ''}
                {row.quantityDelta} {row.part.unit}
              </span>
            )}
            sortable
          />
          <Column field="part.stockQuantity" header="Tồn hiện tại" sortable />
          <Column field="note" header="Ghi chú" body={(row: InventoryTransaction) => row.note || '-'} />
        </DataTable>
      </div>

      <Dialog
        header={dialogMode ? modeLabels[dialogMode] : ''}
        visible={dialogMode !== null}
        className="w-[min(94vw,620px)]"
        onHide={() => setDialogMode(null)}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Phụ tùng
            <select
              className="p-inputtext w-full"
              value={form.partId}
              required
              onChange={(event) => setForm((previous) => ({ ...previous, partId: event.target.value }))}
            >
              {activeParts.map((part) => (
                <option key={part.id} value={part.id}>
                  {part.partNumber} - {part.name} (tồn {part.stockQuantity} {part.unit})
                </option>
              ))}
            </select>
          </label>

          {selectedPart && (
            <div className="flex items-center justify-between border-y border-gray-200 py-3 text-sm">
              <span className="text-gray-500">Tồn hiện tại</span>
              <strong>
                {selectedPart.stockQuantity} {selectedPart.unit}
              </strong>
            </div>
          )}

          <label
            htmlFor="inventory-quantity"
            className="flex flex-col gap-1 text-sm font-medium text-gray-700"
          >
            {dialogMode === 'adjustment' ? 'Chênh lệch tồn kho' : 'Số lượng'}
            <input
              id="inventory-quantity"
              type="number"
              className="p-inputtext w-full"
              value={form.quantity}
              min={dialogMode === 'adjustment' ? undefined : 1}
              required
              onChange={(event) =>
                setForm((previous) => ({ ...previous, quantity: Number(event.target.value) }))
              }
            />
            {dialogMode === 'adjustment' && (
              <small className="font-normal text-gray-500">Nhập số dương để tăng, số âm để giảm tồn.</small>
            )}
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Ghi chú
            <InputTextarea
              value={form.note}
              rows={3}
              required={dialogMode === 'adjustment'}
              onChange={(event) => setForm((previous) => ({ ...previous, note: event.target.value }))}
            />
          </label>

          <div className="flex justify-end gap-2">
            <Button type="button" label="Hủy" severity="secondary" text onClick={() => setDialogMode(null)} />
            <Button type="submit" label="Xác nhận" icon="pi pi-check" loading={isSaving} />
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response
  ) {
    const data = error.response.data as { error?: { message?: string | string[] } };
    const message = data.error?.message;
    return Array.isArray(message) ? message.join(', ') : message || fallback;
  }
  return fallback;
}
