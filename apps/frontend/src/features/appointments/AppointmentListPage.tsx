import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { confirmDelete } from '../../shared/utils/confirmDelete';
import { selectCurrentUser } from '../auth/authSlice';
import { vehicleApi, type Vehicle } from '../vehicles/vehicleApi';
import {
  appointmentApi,
  type Appointment,
  type AppointmentStatus,
} from './appointmentApi';

interface AppointmentFormState {
  vehicleId: string;
  scheduledAt: string;
  serviceNote: string;
  status: AppointmentStatus;
}

const statusOptions: Array<{ label: string; value: AppointmentStatus }> = [
  { label: 'Đã đặt', value: 'Scheduled' },
  { label: 'Đã đến', value: 'Arrived' },
  { label: 'Đã hủy', value: 'Cancelled' },
];

const emptyForm: AppointmentFormState = {
  vehicleId: '',
  scheduledAt: '',
  serviceNote: '',
  status: 'Scheduled',
};

export function AppointmentListPage() {
  const currentUser = useSelector(selectCurrentUser);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [form, setForm] = useState<AppointmentFormState>(emptyForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | null>(null);

  const canRead = Boolean(currentUser);
  const canWrite = currentUser?.role === 'Admin' || currentUser?.role === 'ServiceAdvisor';
  const canDelete = currentUser?.role === 'Admin';

  const vehicleOptions = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        label: `${vehicle.licensePlate} - ${vehicle.customer.fullName}`,
        value: vehicle.id,
      })),
    [vehicles],
  );

  const filteredAppointments = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return appointments.filter((appointment) => {
      const matchesStatus = !statusFilter || appointment.status === statusFilter;
      if (!matchesStatus) return false;
      if (!keyword) return true;

      return [
        appointment.vehicle.licensePlate,
        appointment.vehicle.make,
        appointment.vehicle.model,
        appointment.vehicle.customer.fullName,
        appointment.vehicle.customer.phone,
        appointment.vehicle.customer.companyName,
        appointment.serviceNote,
        appointment.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [appointments, search, statusFilter]);

  const loadData = async () => {
    if (!canRead) return;
    setIsLoading(true);
    setError(null);
    try {
      const [appointmentRows, vehicleRows] = await Promise.all([
        appointmentApi.list(),
        vehicleApi.list(),
      ]);
      setAppointments(appointmentRows);
      setVehicles(vehicleRows);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được danh sách lịch hẹn'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [canRead]);

  const openCreateDialog = () => {
    const start = new Date();
    start.setHours(start.getHours() + 2, 0, 0, 0);
    setEditingAppointment(null);
    setForm({
      ...emptyForm,
      vehicleId: vehicles[0]?.id ?? '',
      scheduledAt: toDatetimeLocalValue(start.toISOString()),
    });
    setDialogOpen(true);
  };

  const openEditDialog = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setForm({
      vehicleId: appointment.vehicleId,
      scheduledAt: toDatetimeLocalValue(appointment.scheduledAt),
      serviceNote: appointment.serviceNote ?? '',
      status: appointment.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      vehicleId: form.vehicleId,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      serviceNote: form.serviceNote || null,
      ...(editingAppointment ? { status: form.status } : {}),
    };

    try {
      if (editingAppointment) {
        await appointmentApi.update(editingAppointment.id, payload);
        setSuccess('Đã cập nhật lịch hẹn');
      } else {
        await appointmentApi.create(payload);
        setSuccess('Đã tạo lịch hẹn');
      }
      setDialogOpen(false);
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không lưu được lịch hẹn'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async (appointment: Appointment) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await appointmentApi.update(appointment.id, { status: 'Cancelled' });
      setSuccess('Đã hủy lịch hẹn');
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không hủy được lịch hẹn'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (appointment: Appointment) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await appointmentApi.delete(appointment.id);
      setSuccess('Đã xóa lịch hẹn');
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không xóa được lịch hẹn'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Lịch hẹn</h1>
          <p className="text-sm text-gray-500">Theo dõi lịch đặt dịch vụ, xe đến xưởng và lịch đã hủy.</p>
        </div>
        <div className="page-toolbar">
          <span className="p-input-icon-left page-search">
            <i className="pi pi-search" />
            <InputText
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm lịch hẹn"
            />
          </span>
          <Dropdown
            value={statusFilter}
            options={statusOptions}
            showClear
            placeholder="Trạng thái"
            className="page-filter"
            onChange={(event) => setStatusFilter((event.value as AppointmentStatus | null) ?? null)}
          />
          <Button
            label="Tạo lịch hẹn"
            icon="pi pi-calendar-plus"
            className="page-create-button"
            onClick={openCreateDialog}
            disabled={!canWrite || vehicles.length === 0}
          />
        </div>
      </div>

      {vehicles.length === 0 && !isLoading && (
        <div className="mb-4">
          <Message severity="info" text="Cần có xe trước khi tạo lịch hẹn." />
        </div>
      )}

      {success && (
        <div className="mb-4">
          <Message severity="success" text={success} />
        </div>
      )}

      {error && (
        <div className="mb-4">
          <Message severity="error" text={error} />
        </div>
      )}

      <div className="page-table-surface">
        <DataTable
          value={filteredAppointments}
          loading={isLoading}
          dataKey="id"
          paginator
          rows={10}
          emptyMessage="Chưa có lịch hẹn phù hợp"
          tableStyle={{ minWidth: '74rem' }}
        >
          <Column
            header="Thời gian"
            body={(row: Appointment) => formatDateTime(row.scheduledAt)}
            sortable
          />
          <Column header="Biển số" body={(row: Appointment) => row.vehicle.licensePlate} sortable />
          <Column header="Khách hàng" body={(row: Appointment) => row.vehicle.customer.fullName} sortable />
          <Column header="Xe" body={(row: Appointment) => `${row.vehicle.make} ${row.vehicle.model}`} />
          <Column field="serviceNote" header="Nhu cầu" />
          <Column header="Trạng thái" body={(row: Appointment) => statusLabel(row.status)} sortable />
          <Column
            header="Thao tác"
            body={(row: Appointment) => (
              <div className="flex gap-2">
                <Button
                  icon="pi pi-pencil"
                  rounded
                  text
                  aria-label={`Sửa lịch ${row.vehicle.licensePlate}`}
                  disabled={!canWrite || row.status === 'Cancelled'}
                  onClick={() => openEditDialog(row)}
                />
                <Button
                  icon="pi pi-times"
                  rounded
                  text
                  severity="warning"
                  aria-label={`Hủy lịch ${row.vehicle.licensePlate}`}
                  disabled={!canWrite || row.status !== 'Scheduled'}
                  onClick={() => void handleCancel(row)}
                />
                <Button
                  icon="pi pi-trash"
                  rounded
                  text
                  severity="danger"
                  aria-label={`Xóa lịch ${row.vehicle.licensePlate}`}
                  disabled={!canDelete}
                  onClick={() =>
                    confirmDelete({
                      itemName: `lịch hẹn ${row.vehicle.licensePlate}`,
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
        header={editingAppointment ? 'Cập nhật lịch hẹn' : 'Tạo lịch hẹn'}
        visible={dialogOpen}
        className="w-[min(94vw,760px)]"
        onHide={() => setDialogOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1 text-sm font-medium text-gray-700 md:col-span-2">
              <label htmlFor="appointment-vehicle">Xe</label>
              <Dropdown
                inputId="appointment-vehicle"
                value={form.vehicleId}
                options={vehicleOptions}
                filter
                onChange={(event) => setForm((prev) => ({ ...prev, vehicleId: event.value as string }))}
              />
            </div>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Thời gian hẹn
              <InputText
                type="datetime-local"
                value={form.scheduledAt}
                required
                onChange={(event) => setForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
              />
            </label>
            {editingAppointment && (
              <div className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                <label htmlFor="appointment-status">Trạng thái</label>
                <Dropdown
                  inputId="appointment-status"
                  value={form.status}
                  options={statusOptions}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.value as AppointmentStatus }))}
                />
              </div>
            )}
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 md:col-span-2">
              Nhu cầu dịch vụ
              <InputText
                value={form.serviceNote}
                onChange={(event) => setForm((prev) => ({ ...prev, serviceNote: event.target.value }))}
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

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function statusLabel(status: AppointmentStatus): string {
  return statusOptions.find((option) => option.value === status)?.label ?? status;
}

function toDatetimeLocalValue(value: string): string {
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function getErrorMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
      ?.message ?? fallback
  );
}
