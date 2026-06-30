import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { confirmDelete } from '../../shared/utils/confirmDelete';
import { selectCurrentUser } from '../auth/authSlice';
import { customerApi, type Customer } from '../customers/customerApi';
import { vehicleApi, type Vehicle } from '../vehicles/vehicleApi';
import { reminderApi, type Reminder } from './reminderApi';

type StatusFilter = 'pending' | 'due' | 'sent' | 'all';

interface ReminderFormState {
  customerId: string;
  vehicleId: string;
  dueDate: string;
  message: string;
}

const emptyForm: ReminderFormState = {
  customerId: '',
  vehicleId: '',
  dueDate: '',
  message: '',
};

export function ReminderListPage() {
  const currentUser = useSelector(selectCurrentUser);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [form, setForm] = useState<ReminderFormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canWrite = currentUser?.role === 'Admin' || currentUser?.role === 'ServiceAdvisor';
  const canDelete = currentUser?.role === 'Admin';

  const filteredVehicles = useMemo(
    () => vehicles.filter((vehicle) => !form.customerId || vehicle.customerId === form.customerId),
    [form.customerId, vehicles],
  );

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const today = toDateInputValue(new Date());
      const params =
        statusFilter === 'pending'
          ? { isSent: false }
          : statusFilter === 'due'
            ? { isSent: false, dueTo: today }
            : statusFilter === 'sent'
              ? { isSent: true }
              : {};
      const [customerRows, vehicleRows, reminderRows] = await Promise.all([
        customerApi.list(),
        vehicleApi.list(),
        reminderApi.list({
          ...params,
          search: search.trim() || undefined,
        }),
      ]);
      setCustomers(customerRows);
      setVehicles(vehicleRows);
      setReminders(reminderRows);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được danh sách nhắc bảo dưỡng'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [statusFilter]);

  const openCreateDialog = () => {
    const firstVehicle = vehicles[0];
    setEditingReminder(null);
    setForm({
      customerId: firstVehicle?.customerId ?? customers[0]?.id ?? '',
      vehicleId: firstVehicle?.id ?? '',
      dueDate: toDateInputValue(new Date()),
      message: '',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setForm({
      customerId: reminder.customerId,
      vehicleId: reminder.vehicleId,
      dueDate: toDateInputValue(new Date(reminder.dueDate)),
      message: reminder.message,
    });
    setDialogOpen(true);
  };

  const handleCustomerChange = (customerId: string) => {
    const nextVehicle = vehicles.find((vehicle) => vehicle.customerId === customerId);
    setForm((current) => ({
      ...current,
      customerId,
      vehicleId: nextVehicle?.id ?? '',
    }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingReminder) {
        await reminderApi.update(editingReminder.id, form);
        setSuccess('Đã cập nhật nhắc bảo dưỡng');
      } else {
        await reminderApi.create(form);
        setSuccess('Đã tạo nhắc bảo dưỡng');
      }
      setDialogOpen(false);
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không lưu được nhắc bảo dưỡng'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkSent = async (reminder: Reminder) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await reminderApi.markSent(reminder.id);
      setSuccess('Đã đánh dấu đã nhắc');
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không đánh dấu được nhắc bảo dưỡng'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (reminder: Reminder) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await reminderApi.delete(reminder.id);
      setSuccess('Đã xóa nhắc bảo dưỡng');
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không xóa được nhắc bảo dưỡng'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadData();
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Nhắc bảo dưỡng</h1>
          <p className="text-sm text-gray-500">Theo dõi lịch nhắc khách hàng quay lại bảo dưỡng xe.</p>
        </div>
        <Button
          label="Tạo nhắc"
          icon="pi pi-bell"
          className="page-create-button"
          onClick={openCreateDialog}
          disabled={!canWrite || vehicles.length === 0}
        />
      </div>

      {error && (
        <div className="mb-4">
          <Message severity="error" text={error} />
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Message severity="success" text={success} />
        </div>
      )}
      {vehicles.length === 0 && !isLoading && (
        <div className="mb-4">
          <Message severity="info" text="Cần có khách hàng và xe trước khi tạo nhắc bảo dưỡng." />
        </div>
      )}

      <form onSubmit={handleSearch} className="filter-panel md:grid-cols-[1fr_1fr_auto]">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Trạng thái
          <select
            className="p-inputtext w-full"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            <option value="pending">Chưa nhắc</option>
            <option value="due">Đến hạn</option>
            <option value="sent">Đã nhắc</option>
            <option value="all">Tất cả</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Tìm kiếm
          <InputText
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Biển số, khách hàng, nội dung"
          />
        </label>
        <div className="filter-actions">
          <Button type="submit" label="Tìm" icon="pi pi-search" loading={isLoading} />
        </div>
      </form>

      <div className="page-table-surface">
        <DataTable
          value={reminders}
          dataKey="id"
          loading={isLoading}
          paginator
          rows={10}
          emptyMessage="Chưa có nhắc bảo dưỡng phù hợp"
          tableStyle={{ minWidth: '72rem' }}
        >
          <Column header="Hạn nhắc" body={(row: Reminder) => formatDate(row.dueDate)} sortable />
          <Column header="Khách hàng" body={(row: Reminder) => `${row.customer.fullName} - ${row.customer.phone}`} />
          <Column field="vehicle.licensePlate" header="Biển số" sortable />
          <Column header="Xe" body={(row: Reminder) => `${row.vehicle.make} ${row.vehicle.model} (${row.vehicle.year})`} />
          <Column field="message" header="Nội dung" />
          <Column
            header="Trạng thái"
            body={(row: Reminder) => (
              <Tag
                value={row.isSent ? 'Đã nhắc' : isDue(row) ? 'Đến hạn' : 'Chưa nhắc'}
                severity={row.isSent ? 'success' : isDue(row) ? 'warning' : 'info'}
              />
            )}
          />
          <Column header="Đã gửi lúc" body={(row: Reminder) => (row.sentAt ? formatDateTime(row.sentAt) : '-')} />
          <Column
            header=""
            body={(row: Reminder) => (
              <div className="flex justify-end gap-1">
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  aria-label={`Sửa nhắc ${row.vehicle.licensePlate}`}
                  onClick={() => openEditDialog(row)}
                  disabled={!canWrite || row.isSent}
                />
                <Button
                  icon="pi pi-send"
                  text
                  rounded
                  severity="success"
                  aria-label={`Đánh dấu đã nhắc ${row.vehicle.licensePlate}`}
                  onClick={() => handleMarkSent(row)}
                  disabled={!canWrite || row.isSent || isSaving}
                />
                <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="danger"
                  aria-label={`Xóa nhắc ${row.vehicle.licensePlate}`}
                  onClick={() =>
                    confirmDelete({
                      itemName: `nhắc bảo dưỡng ${row.vehicle.licensePlate}`,
                      accept: () => void handleDelete(row),
                    })
                  }
                  disabled={!canDelete || isSaving}
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header={editingReminder ? 'Sửa nhắc bảo dưỡng' : 'Tạo nhắc bảo dưỡng'}
        visible={dialogOpen}
        style={{ width: 'min(42rem, 95vw)' }}
        modal
        onHide={() => setDialogOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Khách hàng
            <select
              className="p-inputtext w-full"
              value={form.customerId}
              onChange={(event) => handleCustomerChange(event.target.value)}
              required
            >
              <option value="" disabled>Chọn khách hàng</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName} - {customer.phone}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Phương tiện
            <select
              className="p-inputtext w-full"
              value={form.vehicleId}
              onChange={(event) => setForm((current) => ({ ...current, vehicleId: event.target.value }))}
              required
            >
              <option value="" disabled>Chọn phương tiện</option>
              {filteredVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Hạn nhắc
            <InputText
              type="date"
              value={form.dueDate}
              onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Nội dung
            <InputTextarea
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              rows={4}
              required
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" label="Hủy" severity="secondary" onClick={() => setDialogOpen(false)} />
            <Button type="submit" label="Lưu" icon="pi pi-save" loading={isSaving} />
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function isDue(reminder: Reminder) {
  const today = toDateInputValue(new Date());
  return toDateInputValue(new Date(reminder.dueDate)) <= today;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('vi-VN');
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('vi-VN');
}

function toDateInputValue(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string | string[] } } }).response;
    const message = response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (message) return message;
  }
  return fallback;
}
