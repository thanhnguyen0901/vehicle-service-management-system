import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { ToggleButton } from 'primereact/togglebutton';
import { selectCurrentUser } from '../auth/authSlice';
import { partApi, type Part } from './partApi';

interface PartFormState {
  partNumber: string;
  name: string;
  description: string;
  unit: string;
  unitCost: number;
  unitPrice: number;
  stockQuantity: number;
  reorderLevel: number;
}

const emptyForm: PartFormState = {
  partNumber: '',
  name: '',
  description: '',
  unit: 'piece',
  unitCost: 0,
  unitPrice: 0,
  stockQuantity: 0,
  reorderLevel: 5,
};

export function PartsPage() {
  const currentUser = useSelector(selectCurrentUser);
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [form, setForm] = useState<PartFormState>(emptyForm);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const canRead = Boolean(currentUser);
  const canWrite = currentUser?.role === 'Admin' || currentUser?.role === 'InventoryClerk';

  const filteredParts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return parts.filter((part) => {
      const matchesKeyword =
        !keyword ||
        [part.partNumber, part.name, part.description, part.unit, part.isActive ? 'Hoạt động' : 'Ngưng dùng']
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));
      const matchesLowStock = !lowStockOnly || part.stockQuantity <= part.reorderLevel;
      return matchesKeyword && matchesLowStock;
    });
  }, [lowStockOnly, parts, search]);

  const loadParts = async () => {
    if (!canRead) return;
    setIsLoading(true);
    setError(null);
    try {
      setParts(await partApi.list());
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được danh mục phụ tùng'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadParts();
  }, [canRead]);

  const openCreateDialog = () => {
    setEditingPart(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (part: Part) => {
    setEditingPart(part);
    setForm({
      partNumber: part.partNumber,
      name: part.name,
      description: part.description ?? '',
      unit: part.unit,
      unitCost: Number(part.unitCost),
      unitPrice: Number(part.unitPrice),
      stockQuantity: part.stockQuantity,
      reorderLevel: part.reorderLevel,
    });
    setDialogOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = {
      partNumber: form.partNumber,
      name: form.name,
      description: form.description || null,
      unit: form.unit,
      unitCost: form.unitCost,
      unitPrice: form.unitPrice,
      stockQuantity: form.stockQuantity,
      reorderLevel: form.reorderLevel,
    };

    try {
      if (editingPart) {
        await partApi.update(editingPart.id, payload);
      } else {
        await partApi.create(payload);
      }
      setDialogOpen(false);
      await loadParts();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không lưu được phụ tùng'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (part: Part) => {
    setIsSaving(true);
    setError(null);
    try {
      await partApi.toggle(part.id, !part.isActive);
      await loadParts();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không đổi trạng thái phụ tùng'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Phụ tùng</h1>
          <p className="text-sm text-gray-500">Quản lý mã phụ tùng, đơn vị tính, giá chuẩn và tồn kho hiện tại.</p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm phụ tùng"
              className="w-full md:w-72"
            />
          </span>
          <ToggleButton
            checked={lowStockOnly}
            onChange={(event) => setLowStockOnly(Boolean(event.value))}
            aria-label="Lọc tồn thấp"
            onLabel="Tồn thấp"
            offLabel="Tất cả tồn kho"
            onIcon="pi pi-exclamation-triangle"
            offIcon="pi pi-box"
            className="w-full md:w-44"
          />
          <Button label="Tạo phụ tùng" icon="pi pi-plus" onClick={openCreateDialog} disabled={!canWrite} />
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Message severity="error" text={error} />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <DataTable
          value={filteredParts}
          loading={isLoading}
          dataKey="id"
          paginator
          rows={10}
          emptyMessage="Chưa có phụ tùng phù hợp"
          tableStyle={{ minWidth: '80rem' }}
        >
          <Column field="partNumber" header="Mã phụ tùng" sortable />
          <Column field="name" header="Tên phụ tùng" sortable />
          <Column field="unit" header="Đơn vị" />
          <Column header="Giá vốn" body={(row: Part) => formatCurrency(Number(row.unitCost))} sortable />
          <Column header="Giá bán" body={(row: Part) => formatCurrency(Number(row.unitPrice))} sortable />
          <Column field="stockQuantity" header="Tồn" sortable />
          <Column field="reorderLevel" header="Mức đặt lại" sortable />
          <Column
            header="Tồn thấp"
            body={(row: Part) =>
              row.stockQuantity <= row.reorderLevel ? <Tag value="Cần nhập" severity="warning" /> : <Tag value="Đủ" severity="success" />
            }
          />
          <Column
            header="Trạng thái"
            body={(row: Part) => (
              <Tag value={row.isActive ? 'Hoạt động' : 'Ngưng dùng'} severity={row.isActive ? 'success' : 'danger'} />
            )}
          />
          <Column
            header="Thao tác"
            body={(row: Part) => (
              <div className="flex gap-2">
                <Button
                  icon="pi pi-pencil"
                  rounded
                  text
                  aria-label={`Sửa ${row.partNumber}`}
                  disabled={!canWrite}
                  onClick={() => openEditDialog(row)}
                />
                <Button
                  icon={row.isActive ? 'pi pi-ban' : 'pi pi-check'}
                  rounded
                  text
                  severity={row.isActive ? 'danger' : 'success'}
                  aria-label={`${row.isActive ? 'Ngưng dùng' : 'Kích hoạt'} ${row.partNumber}`}
                  disabled={!canWrite || isSaving}
                  onClick={() => void handleToggle(row)}
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header={editingPart ? 'Cập nhật phụ tùng' : 'Tạo phụ tùng'}
        visible={dialogOpen}
        className="w-[min(94vw,820px)]"
        onHide={() => setDialogOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Mã phụ tùng
              <InputText
                value={form.partNumber}
                required
                onChange={(event) => setForm((prev) => ({ ...prev, partNumber: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Tên phụ tùng
              <InputText
                value={form.name}
                required
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Đơn vị tính
              <InputText
                value={form.unit}
                required
                onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Giá vốn
              <InputNumber
                value={form.unitCost}
                required
                min={0}
                inputClassName="w-full"
                onValueChange={(event) => setForm((prev) => ({ ...prev, unitCost: Number(event.value ?? 0) }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Giá bán
              <InputNumber
                value={form.unitPrice}
                required
                min={0}
                inputClassName="w-full"
                onValueChange={(event) => setForm((prev) => ({ ...prev, unitPrice: Number(event.value ?? 0) }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Tồn kho
              <InputNumber
                value={form.stockQuantity}
                required
                useGrouping={false}
                min={0}
                inputClassName="w-full"
                onValueChange={(event) =>
                  setForm((prev) => ({ ...prev, stockQuantity: Number(event.value ?? 0) }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Mức đặt lại
              <InputNumber
                value={form.reorderLevel}
                required
                useGrouping={false}
                min={0}
                inputClassName="w-full"
                onValueChange={(event) =>
                  setForm((prev) => ({ ...prev, reorderLevel: Number(event.value ?? 0) }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 md:col-span-2">
              Mô tả
              <InputTextarea
                value={form.description}
                rows={3}
                autoResize
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" label="Hủy" severity="secondary" outlined onClick={() => setDialogOpen(false)} />
            <Button type="submit" label="Lưu" icon="pi pi-save" loading={isSaving} />
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function getErrorMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
      ?.message ?? fallback
  );
}
