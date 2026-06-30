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
import { selectCurrentUser } from '../auth/authSlice';
import { serviceCatalogApi, type RepairService } from './serviceCatalogApi';

interface ServiceFormState {
  name: string;
  description: string;
  unitPrice: number;
  durationMin: number | null;
}

const emptyForm: ServiceFormState = {
  name: '',
  description: '',
  unitPrice: 0,
  durationMin: null,
};

export function ServiceCatalogPage() {
  const currentUser = useSelector(selectCurrentUser);
  const [services, setServices] = useState<RepairService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<RepairService | null>(null);
  const [form, setForm] = useState<ServiceFormState>(emptyForm);
  const [search, setSearch] = useState('');

  const canRead = Boolean(currentUser);
  const canWrite = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  const filteredServices = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return services;
    return services.filter((service) =>
      [service.name, service.description, service.unitPrice, service.durationMin, service.isActive ? 'Hoạt động' : 'Ngưng dùng']
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [search, services]);

  const loadServices = async () => {
    if (!canRead) return;
    setIsLoading(true);
    setError(null);
    try {
      setServices(await serviceCatalogApi.list());
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được danh mục dịch vụ'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadServices();
  }, [canRead]);

  const openCreateDialog = () => {
    setEditingService(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (service: RepairService) => {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description ?? '',
      unitPrice: Number(service.unitPrice),
      durationMin: service.durationMin,
    });
    setDialogOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      description: form.description || null,
      unitPrice: form.unitPrice,
      durationMin: form.durationMin,
    };

    try {
      if (editingService) {
        await serviceCatalogApi.update(editingService.id, payload);
      } else {
        await serviceCatalogApi.create(payload);
      }
      setDialogOpen(false);
      await loadServices();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không lưu được dịch vụ'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (service: RepairService) => {
    setIsSaving(true);
    setError(null);
    try {
      await serviceCatalogApi.toggle(service.id, !service.isActive);
      await loadServices();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không đổi trạng thái dịch vụ'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Dịch vụ</h1>
          <p className="text-sm text-gray-500">Quản lý danh mục dịch vụ, đơn giá chuẩn và thời lượng dự kiến.</p>
        </div>
        <div className="page-toolbar">
          <span className="p-input-icon-left page-search">
            <i className="pi pi-search" />
            <InputText
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm dịch vụ"
            />
          </span>
          <Button
            label="Tạo dịch vụ"
            icon="pi pi-plus"
            className="page-create-button"
            onClick={openCreateDialog}
            disabled={!canWrite}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Message severity="error" text={error} />
        </div>
      )}

      <div className="page-table-surface">
        <DataTable
          value={filteredServices}
          loading={isLoading}
          dataKey="id"
          paginator
          rows={10}
          emptyMessage="Chưa có dịch vụ phù hợp"
          tableStyle={{ minWidth: '64rem' }}
        >
          <Column field="name" header="Tên dịch vụ" sortable />
          <Column field="description" header="Mô tả" />
          <Column header="Đơn giá" body={(row: RepairService) => formatCurrency(Number(row.unitPrice))} sortable />
          <Column field="durationMin" header="Phút" sortable />
          <Column
            header="Trạng thái"
            body={(row: RepairService) => (
              <Tag value={row.isActive ? 'Hoạt động' : 'Ngưng dùng'} severity={row.isActive ? 'success' : 'danger'} />
            )}
          />
          <Column
            header="Thao tác"
            body={(row: RepairService) => (
              <div className="flex gap-2">
                <Button
                  icon="pi pi-pencil"
                  rounded
                  text
                  aria-label={`Sửa ${row.name}`}
                  disabled={!canWrite}
                  onClick={() => openEditDialog(row)}
                />
                <Button
                  icon={row.isActive ? 'pi pi-ban' : 'pi pi-check'}
                  rounded
                  text
                  severity={row.isActive ? 'danger' : 'success'}
                  aria-label={`${row.isActive ? 'Ngưng dùng' : 'Kích hoạt'} ${row.name}`}
                  disabled={!canWrite || isSaving}
                  onClick={() => void handleToggle(row)}
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header={editingService ? 'Cập nhật dịch vụ' : 'Tạo dịch vụ'}
        visible={dialogOpen}
        className="w-[min(94vw,640px)]"
        onHide={() => setDialogOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 sm:col-span-2">
              Tên dịch vụ
              <InputText
                value={form.name}
                required
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Đơn giá
              <InputNumber
                value={form.unitPrice}
                required
                min={0}
                inputClassName="w-full"
                onValueChange={(event) =>
                  setForm((prev) => ({ ...prev, unitPrice: Number(event.value ?? 0) }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Thời lượng phút
              <InputNumber
                value={form.durationMin}
                min={0}
                useGrouping={false}
                inputClassName="w-full"
                onValueChange={(event) =>
                  setForm((prev) => ({ ...prev, durationMin: event.value === null ? null : Number(event.value) }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 sm:col-span-2">
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
