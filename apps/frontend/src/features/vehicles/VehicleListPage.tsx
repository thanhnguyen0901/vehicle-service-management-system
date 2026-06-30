import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { confirmDelete } from '../../shared/utils/confirmDelete';
import { selectCurrentUser } from '../auth/authSlice';
import { customerApi, type Customer } from '../customers/customerApi';
import { vehicleApi, type Vehicle } from './vehicleApi';

interface VehicleFormState {
  customerId: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  mileage: number | null;
}

const emptyForm: VehicleFormState = {
  customerId: '',
  licensePlate: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  color: '',
  vin: '',
  mileage: null,
};

export function VehicleListPage() {
  const currentUser = useSelector(selectCurrentUser);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<VehicleFormState>(emptyForm);
  const [search, setSearch] = useState('');

  const canRead = Boolean(currentUser);
  const canWrite = currentUser?.role === 'Admin' || currentUser?.role === 'ServiceAdvisor';
  const canDelete = currentUser?.role === 'Admin';

  const customerOptions = useMemo(
    () =>
      customers.map((customer) => ({
        label: `${customer.fullName} - ${customer.phone}`,
        value: customer.id,
      })),
    [customers],
  );

  const filteredVehicles = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return vehicles;

    return vehicles.filter((vehicle) =>
      [
        vehicle.licensePlate,
        vehicle.make,
        vehicle.model,
        vehicle.color,
        vehicle.vin,
        vehicle.customer.fullName,
        vehicle.customer.phone,
        vehicle.customer.companyName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [search, vehicles]);

  const loadData = async () => {
    if (!canRead) return;
    setIsLoading(true);
    setError(null);
    try {
      const [vehicleRows, customerRows] = await Promise.all([vehicleApi.list(), customerApi.list()]);
      setVehicles(vehicleRows);
      setCustomers(customerRows);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được danh sách xe'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [canRead]);

  const openCreateDialog = () => {
    setEditingVehicle(null);
    setForm({
      ...emptyForm,
      customerId: customers[0]?.id ?? '',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setForm({
      customerId: vehicle.customerId,
      licensePlate: vehicle.licensePlate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color ?? '',
      vin: vehicle.vin ?? '',
      mileage: vehicle.mileage,
    });
    setDialogOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = {
      customerId: form.customerId,
      licensePlate: form.licensePlate,
      make: form.make,
      model: form.model,
      year: form.year,
      color: form.color || null,
      vin: form.vin || null,
      mileage: form.mileage,
    };

    try {
      if (editingVehicle) {
        await vehicleApi.update(editingVehicle.id, payload);
      } else {
        await vehicleApi.create(payload);
      }
      setDialogOpen(false);
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không lưu được xe'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    setIsSaving(true);
    setError(null);
    try {
      await vehicleApi.delete(vehicle.id);
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không xóa được xe'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Phương tiện</h1>
          <p className="text-sm text-gray-500">Quản lý xe theo khách hàng, biển số và thông tin nhận diện.</p>
        </div>
        <div className="page-toolbar">
          <span className="p-input-icon-left page-search">
            <i className="pi pi-search" />
            <InputText
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm xe"
            />
          </span>
          <Button
            label="Tạo xe"
            icon="pi pi-plus"
            className="page-create-button"
            onClick={openCreateDialog}
            disabled={!canWrite || customers.length === 0}
          />
        </div>
      </div>

      {customers.length === 0 && !isLoading && (
        <div className="mb-4">
          <Message severity="info" text="Cần có khách hàng trước khi tạo xe." />
        </div>
      )}

      {error && (
        <div className="mb-4">
          <Message severity="error" text={error} />
        </div>
      )}

      <div className="page-table-surface">
        <DataTable
          value={filteredVehicles}
          loading={isLoading}
          dataKey="id"
          paginator
          rows={10}
          emptyMessage="Chưa có xe phù hợp"
          tableStyle={{ minWidth: '72rem' }}
        >
          <Column field="licensePlate" header="Biển số" sortable />
          <Column header="Khách hàng" body={(row: Vehicle) => row.customer.fullName} sortable />
          <Column field="make" header="Hãng" sortable />
          <Column field="model" header="Dòng xe" sortable />
          <Column field="year" header="Năm" sortable />
          <Column field="color" header="Màu" />
          <Column field="vin" header="VIN" />
          <Column field="mileage" header="Odo" />
          <Column
            header="Thao tác"
            body={(row: Vehicle) => (
              <div className="flex gap-2">
                <Button
                  icon="pi pi-pencil"
                  rounded
                  text
                  aria-label={`Sửa ${row.licensePlate}`}
                  disabled={!canWrite}
                  onClick={() => openEditDialog(row)}
                />
                <Button
                  icon="pi pi-trash"
                  rounded
                  text
                  severity="danger"
                  aria-label={`Xóa ${row.licensePlate}`}
                  disabled={!canDelete}
                  onClick={() =>
                    confirmDelete({
                      itemName: `xe ${row.licensePlate}`,
                      accept: () => void handleDelete(row),
                    })
                  }
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header={editingVehicle ? 'Cập nhật xe' : 'Tạo xe'}
        visible={dialogOpen}
        className="w-[min(94vw,760px)]"
        onHide={() => setDialogOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1 text-sm font-medium text-gray-700 md:col-span-2">
              <label htmlFor="vehicle-customer">Khách hàng</label>
              <Dropdown
                inputId="vehicle-customer"
                value={form.customerId}
                options={customerOptions}
                filter
                onChange={(event) => setForm((prev) => ({ ...prev, customerId: event.value as string }))}
              />
            </div>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Biển số
              <InputText
                value={form.licensePlate}
                required
                onChange={(event) => setForm((prev) => ({ ...prev, licensePlate: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Hãng
              <InputText
                value={form.make}
                required
                onChange={(event) => setForm((prev) => ({ ...prev, make: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Dòng xe
              <InputText
                value={form.model}
                required
                onChange={(event) => setForm((prev) => ({ ...prev, model: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Năm sản xuất
              <InputNumber
                value={form.year}
                required
                useGrouping={false}
                min={1900}
                max={new Date().getFullYear() + 1}
                inputClassName="w-full"
                onValueChange={(event) =>
                  setForm((prev) => ({ ...prev, year: Number(event.value ?? new Date().getFullYear()) }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Màu
              <InputText
                value={form.color}
                onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              VIN
              <InputText
                value={form.vin}
                onChange={(event) => setForm((prev) => ({ ...prev, vin: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Odo
              <InputNumber
                value={form.mileage}
                useGrouping={false}
                min={0}
                inputClassName="w-full"
                onValueChange={(event) =>
                  setForm((prev) => ({ ...prev, mileage: event.value === null ? null : Number(event.value) }))
                }
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

function getErrorMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
      ?.message ?? fallback
  );
}
