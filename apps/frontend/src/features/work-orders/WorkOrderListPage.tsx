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
import { selectCurrentUser } from '../auth/authSlice';
import { appointmentApi, type Appointment } from '../appointments/appointmentApi';
import { partApi, type Part } from '../parts/partApi';
import { serviceCatalogApi, type RepairService } from '../services/serviceCatalogApi';
import { vehicleApi, type Vehicle } from '../vehicles/vehicleApi';
import {
  workOrderApi,
  type PartUsage,
  type WorkOrder,
  type WorkOrderItem,
  type WorkOrderStatus,
} from './workOrderApi';

interface WorkOrderFormState {
  source: 'appointment' | 'vehicle';
  appointmentId: string;
  vehicleId: string;
  diagnosis: string;
}

interface ItemFormState {
  serviceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface PartUsageFormState {
  workOrderItemId: string;
  partId: string;
  quantity: number;
  unitPrice: number;
}

interface PartUsageRow extends PartUsage {
  workOrderItemId: string;
  workOrderItemDescription: string;
}

const statusOptions: Array<{ label: string; value: WorkOrderStatus }> = [
  { label: 'Tiếp nhận', value: 'Received' },
  { label: 'Chẩn đoán', value: 'Diagnosing' },
  { label: 'Đang sửa', value: 'Repairing' },
  { label: 'Chờ phụ tùng', value: 'WaitingParts' },
  { label: 'Sẵn sàng giao', value: 'ReadyForDelivery' },
  { label: 'Đã giao', value: 'Delivered' },
  { label: 'Đã hủy', value: 'Cancelled' },
];

const sourceOptions = [
  { label: 'Từ lịch hẹn', value: 'appointment' },
  { label: 'Walk-in', value: 'vehicle' },
];

const emptyWorkOrderForm: WorkOrderFormState = {
  source: 'appointment',
  appointmentId: '',
  vehicleId: '',
  diagnosis: '',
};

const emptyItemForm: ItemFormState = {
  serviceId: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
};

const emptyPartUsageForm: PartUsageFormState = {
  workOrderItemId: '',
  partId: '',
  quantity: 1,
  unitPrice: 0,
};

export function WorkOrderListPage() {
  const currentUser = useSelector(selectCurrentUser);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<RepairService[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [editingItem, setEditingItem] = useState<WorkOrderItem | null>(null);
  const [editingPartUsage, setEditingPartUsage] = useState<PartUsageRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [form, setForm] = useState<WorkOrderFormState>(emptyWorkOrderForm);
  const [itemForm, setItemForm] = useState<ItemFormState>(emptyItemForm);
  const [partUsageForm, setPartUsageForm] = useState<PartUsageFormState>(emptyPartUsageForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | null>(null);

  const canRead = Boolean(currentUser);
  const canCreate = currentUser?.role === 'Admin' || currentUser?.role === 'ServiceAdvisor';
  const canWrite =
    currentUser?.role === 'Admin' ||
    currentUser?.role === 'ServiceAdvisor' ||
    currentUser?.role === 'Technician';
  const canManageParts =
    currentUser?.role === 'Admin' ||
    currentUser?.role === 'ServiceAdvisor' ||
    currentUser?.role === 'Technician' ||
    currentUser?.role === 'InventoryClerk';

  const appointmentOptions = useMemo(
    () =>
      appointments
        .filter((appointment) => !appointment.workOrder && appointment.status !== 'Cancelled')
        .map((appointment) => ({
          label: `${appointment.vehicle.licensePlate} - ${appointment.vehicle.customer.fullName}`,
          value: appointment.id,
        })),
    [appointments],
  );

  const vehicleOptions = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        label: `${vehicle.licensePlate} - ${vehicle.customer.fullName}`,
        value: vehicle.id,
      })),
    [vehicles],
  );

  const serviceOptions = useMemo(
    () =>
      services
        .filter((service) => service.isActive)
        .map((service) => ({
          label: service.name,
          value: service.id,
        })),
    [services],
  );

  const partOptions = useMemo(
    () =>
      parts
        .filter((part) => part.isActive)
        .map((part) => ({
          label: `${part.partNumber} - ${part.name} (tồn ${part.stockQuantity} ${part.unit})`,
          value: part.id,
        })),
    [parts],
  );

  const workOrderItemOptions = useMemo(
    () =>
      selectedWorkOrder?.items.map((item) => ({
        label: item.description,
        value: item.id,
      })) ?? [],
    [selectedWorkOrder],
  );

  const partUsageRows = useMemo<PartUsageRow[]>(
    () =>
      selectedWorkOrder?.items.flatMap((item) =>
        item.partUsages.map((usage) => ({
          ...usage,
          workOrderItemId: item.id,
          workOrderItemDescription: item.description,
        })),
      ) ?? [],
    [selectedWorkOrder],
  );

  const filteredWorkOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return workOrders.filter((workOrder) => {
      const matchesStatus = !statusFilter || workOrder.status === statusFilter;
      if (!matchesStatus) return false;
      if (!keyword) return true;

      return [
        workOrder.vehicle.licensePlate,
        workOrder.vehicle.make,
        workOrder.vehicle.model,
        workOrder.vehicle.customer.fullName,
        workOrder.vehicle.customer.phone,
        workOrder.vehicle.customer.companyName,
        workOrder.diagnosis,
        workOrder.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [search, statusFilter, workOrders]);

  const loadData = async () => {
    if (!canRead) return;
    setIsLoading(true);
    setError(null);
    try {
      const [workOrderRows, appointmentRows, vehicleRows, serviceRows, partRows] = await Promise.all([
        workOrderApi.list(),
        canCreate ? appointmentApi.list() : Promise.resolve([]),
        vehicleApi.list(),
        serviceCatalogApi.list(),
        partApi.list(),
      ]);
      setWorkOrders(workOrderRows);
      setAppointments(appointmentRows);
      setVehicles(vehicleRows);
      setServices(serviceRows);
      setParts(partRows);
      if (selectedWorkOrder) {
        setSelectedWorkOrder(workOrderRows.find((row) => row.id === selectedWorkOrder.id) ?? null);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được danh sách phiếu sửa chữa'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [canRead]);

  const openCreateDialog = () => {
    setForm({
      ...emptyWorkOrderForm,
      source: appointmentOptions.length > 0 ? 'appointment' : 'vehicle',
      appointmentId: appointmentOptions[0]?.value ?? '',
      vehicleId: vehicleOptions[0]?.value ?? '',
    });
    setCreateOpen(true);
  };

  const openDetailDialog = async (workOrder: WorkOrder) => {
    setError(null);
    try {
      const detail = await workOrderApi.get(workOrder.id);
      setSelectedWorkOrder(detail);
      setEditingItem(null);
      setEditingPartUsage(null);
      setItemForm(emptyItemForm);
      setPartUsageForm({
        ...emptyPartUsageForm,
        workOrderItemId: detail.items[0]?.id ?? '',
        partId: parts.find((part) => part.isActive)?.id ?? '',
        unitPrice: Number(parts.find((part) => part.isActive)?.unitPrice ?? 0),
      });
      setDetailOpen(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được chi tiết phiếu'));
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload =
        form.source === 'appointment'
          ? { appointmentId: form.appointmentId, diagnosis: form.diagnosis || null }
          : { vehicleId: form.vehicleId, diagnosis: form.diagnosis || null };
      await workOrderApi.create(payload);
      setSuccess('Đã tạo phiếu sửa chữa');
      setCreateOpen(false);
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tạo được phiếu sửa chữa'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (status: WorkOrderStatus) => {
    if (!selectedWorkOrder) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await workOrderApi.updateStatus(selectedWorkOrder.id, status, selectedWorkOrder.diagnosis);
      setSelectedWorkOrder(updated);
      setSuccess('Đã cập nhật trạng thái phiếu');
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không cập nhật được trạng thái'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedWorkOrder) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        serviceId: itemForm.serviceId || null,
        description: itemForm.description,
        quantity: itemForm.quantity,
        unitPrice: itemForm.unitPrice,
      };
      if (editingItem) {
        await workOrderApi.updateItem(selectedWorkOrder.id, editingItem.id, payload);
        setSuccess('Đã cập nhật hạng mục');
      } else {
        await workOrderApi.addItem(selectedWorkOrder.id, payload);
        setSuccess('Đã thêm hạng mục');
      }
      const detail = await workOrderApi.get(selectedWorkOrder.id);
      setSelectedWorkOrder(detail);
      setPartUsageForm((previous) => ({
        ...previous,
        workOrderItemId: previous.workOrderItemId || detail.items[0]?.id || '',
      }));
      setEditingItem(null);
      setItemForm(emptyItemForm);
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không lưu được hạng mục'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (item: WorkOrderItem) => {
    if (!selectedWorkOrder) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await workOrderApi.deleteItem(selectedWorkOrder.id, item.id);
      const detail = await workOrderApi.get(selectedWorkOrder.id);
      setSelectedWorkOrder(detail);
      setSuccess('Đã xóa hạng mục');
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không xóa được hạng mục'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find((item) => item.id === serviceId);
    setItemForm((prev) => ({
      ...prev,
      serviceId,
      description: service?.name ?? prev.description,
      unitPrice: service ? Number(service.unitPrice) : prev.unitPrice,
    }));
  };

  const openEditItem = (item: WorkOrderItem) => {
    setEditingItem(item);
    setItemForm({
      serviceId: item.serviceId ?? '',
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    });
  };

  const resetItemForm = () => {
    setEditingItem(null);
    setItemForm(emptyItemForm);
  };

  const refreshWorkOrderDetail = async (workOrderId: string) => {
    const [detail, partRows] = await Promise.all([workOrderApi.get(workOrderId), partApi.list()]);
    setSelectedWorkOrder(detail);
    setParts(partRows);
    await loadData();
  };

  const handlePartSelect = (partId: string) => {
    const part = parts.find((item) => item.id === partId);
    setPartUsageForm((previous) => ({
      ...previous,
      partId,
      unitPrice: part ? Number(part.unitPrice) : previous.unitPrice,
    }));
  };

  const handleSavePartUsage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedWorkOrder) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingPartUsage) {
        await workOrderApi.updatePartUsage(selectedWorkOrder.id, editingPartUsage.id, {
          partId: partUsageForm.partId,
          quantity: partUsageForm.quantity,
          unitPrice: partUsageForm.unitPrice,
        });
        setSuccess('Đã cập nhật phụ tùng sử dụng');
      } else {
        await workOrderApi.addPartUsage(selectedWorkOrder.id, partUsageForm);
        setSuccess('Đã ghi nhận phụ tùng sử dụng');
      }
      setEditingPartUsage(null);
      setPartUsageForm({
        ...emptyPartUsageForm,
        workOrderItemId: selectedWorkOrder.items[0]?.id ?? '',
        partId: parts.find((part) => part.isActive)?.id ?? '',
        unitPrice: Number(parts.find((part) => part.isActive)?.unitPrice ?? 0),
      });
      await refreshWorkOrderDetail(selectedWorkOrder.id);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không lưu được phụ tùng sử dụng'));
    } finally {
      setIsSaving(false);
    }
  };

  const openEditPartUsage = (usage: PartUsageRow) => {
    setEditingPartUsage(usage);
    setPartUsageForm({
      workOrderItemId: usage.workOrderItemId,
      partId: usage.partId,
      quantity: usage.quantity,
      unitPrice: Number(usage.unitPrice),
    });
  };

  const resetPartUsageForm = () => {
    setEditingPartUsage(null);
    setPartUsageForm({
      ...emptyPartUsageForm,
      workOrderItemId: selectedWorkOrder?.items[0]?.id ?? '',
      partId: parts.find((part) => part.isActive)?.id ?? '',
      unitPrice: Number(parts.find((part) => part.isActive)?.unitPrice ?? 0),
    });
  };

  const handleDeletePartUsage = async (usage: PartUsageRow) => {
    if (!selectedWorkOrder) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await workOrderApi.deletePartUsage(selectedWorkOrder.id, usage.id);
      setSuccess('Đã xóa phụ tùng sử dụng và hoàn tồn kho');
      resetPartUsageForm();
      await refreshWorkOrderDetail(selectedWorkOrder.id);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không xóa được phụ tùng sử dụng'));
    } finally {
      setIsSaving(false);
    }
  };

  const detailIsLocked =
    selectedWorkOrder?.status === 'Delivered' || selectedWorkOrder?.status === 'Cancelled';
  const totalAmount = selectedWorkOrder?.items.reduce((sum, item) => sum + Number(item.amount), 0) ?? 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Phiếu sửa chữa</h1>
          <p className="text-sm text-gray-500">Tiếp nhận xe, theo dõi trạng thái và hạng mục dịch vụ.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm phiếu"
              className="w-full sm:w-64"
            />
          </span>
          <Dropdown
            value={statusFilter}
            options={statusOptions}
            showClear
            placeholder="Trạng thái"
            className="w-full sm:w-48"
            onChange={(event) => setStatusFilter((event.value as WorkOrderStatus | null) ?? null)}
          />
          <Button
            label="Tạo phiếu"
            icon="pi pi-file-plus"
            onClick={openCreateDialog}
            disabled={!canCreate || vehicles.length === 0}
          />
        </div>
      </div>

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

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <DataTable
          value={filteredWorkOrders}
          loading={isLoading}
          dataKey="id"
          paginator
          rows={10}
          emptyMessage="Chưa có phiếu sửa chữa phù hợp"
          tableStyle={{ minWidth: '76rem' }}
        >
          <Column header="Biển số" body={(row: WorkOrder) => row.vehicle.licensePlate} sortable />
          <Column header="Khách hàng" body={(row: WorkOrder) => row.vehicle.customer.fullName} sortable />
          <Column header="Xe" body={(row: WorkOrder) => `${row.vehicle.make} ${row.vehicle.model}`} />
          <Column header="Trạng thái" body={(row: WorkOrder) => statusLabel(row.status)} sortable />
          <Column header="Tiếp nhận" body={(row: WorkOrder) => formatDateTime(row.receivedAt)} sortable />
          <Column field="diagnosis" header="Chẩn đoán" />
          <Column
            header="Thao tác"
            body={(row: WorkOrder) => (
              <Button
                icon="pi pi-eye"
                rounded
                text
                aria-label={`Xem phiếu ${row.vehicle.licensePlate}`}
                onClick={() => void openDetailDialog(row)}
              />
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header="Tạo phiếu sửa chữa"
        visible={createOpen}
        className="w-[min(94vw,760px)]"
        onHide={() => setCreateOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleCreate}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              <label htmlFor="work-order-source">Nguồn</label>
              <Dropdown
                inputId="work-order-source"
                value={form.source}
                options={sourceOptions}
                onChange={(event) => setForm((prev) => ({ ...prev, source: event.value as 'appointment' | 'vehicle' }))}
              />
            </div>
            {form.source === 'appointment' ? (
              <div className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                <label htmlFor="work-order-appointment">Lịch hẹn</label>
                <Dropdown
                  inputId="work-order-appointment"
                  value={form.appointmentId}
                  options={appointmentOptions}
                  filter
                  onChange={(event) => setForm((prev) => ({ ...prev, appointmentId: event.value as string }))}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                <label htmlFor="work-order-vehicle">Xe</label>
                <Dropdown
                  inputId="work-order-vehicle"
                  value={form.vehicleId}
                  options={vehicleOptions}
                  filter
                  onChange={(event) => setForm((prev) => ({ ...prev, vehicleId: event.value as string }))}
                />
              </div>
            )}
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 md:col-span-2">
              Chẩn đoán ban đầu
              <InputText
                value={form.diagnosis}
                onChange={(event) => setForm((prev) => ({ ...prev, diagnosis: event.target.value }))}
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" label="Hủy" severity="secondary" outlined onClick={() => setCreateOpen(false)} />
            <Button type="submit" label="Lưu" icon="pi pi-save" loading={isSaving} />
          </div>
        </form>
      </Dialog>

      <Dialog
        header={selectedWorkOrder ? `Phiếu ${selectedWorkOrder.vehicle.licensePlate}` : 'Chi tiết phiếu'}
        visible={detailOpen}
        className="w-[min(96vw,980px)]"
        onHide={() => setDetailOpen(false)}
      >
        {selectedWorkOrder && (
          <div className="space-y-5">
            <div className="grid gap-3 rounded-lg bg-gray-50 p-4 text-sm md:grid-cols-3">
              <div>
                <div className="text-gray-500">Khách hàng</div>
                <div className="font-semibold text-gray-800">{selectedWorkOrder.vehicle.customer.fullName}</div>
              </div>
              <div>
                <div className="text-gray-500">Xe</div>
                <div className="font-semibold text-gray-800">
                  {selectedWorkOrder.vehicle.make} {selectedWorkOrder.vehicle.model}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="work-order-status" className="text-gray-500">
                  Trạng thái
                </label>
                <Dropdown
                  inputId="work-order-status"
                  value={selectedWorkOrder.status}
                  options={statusOptions}
                  disabled={!canWrite || detailIsLocked}
                  onChange={(event) => void handleStatusChange(event.value as WorkOrderStatus)}
                />
              </div>
            </div>

            <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleSaveItem}>
              <div className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                <label htmlFor="work-order-service">Dịch vụ</label>
                <Dropdown
                  inputId="work-order-service"
                  value={itemForm.serviceId}
                  options={serviceOptions}
                  filter
                  disabled={detailIsLocked}
                  onChange={(event) => handleServiceSelect(event.value as string)}
                />
              </div>
              <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                Hạng mục
                <InputText
                  value={itemForm.description}
                  required
                  disabled={detailIsLocked}
                  onChange={(event) => setItemForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                SL
                <InputNumber
                  value={itemForm.quantity}
                  min={1}
                  useGrouping={false}
                  disabled={detailIsLocked}
                  inputClassName="w-full"
                  onValueChange={(event) => setItemForm((prev) => ({ ...prev, quantity: Number(event.value ?? 1) }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                Đơn giá
                <InputNumber
                  value={itemForm.unitPrice}
                  min={0}
                  useGrouping={false}
                  disabled={detailIsLocked}
                  inputClassName="w-full"
                  onValueChange={(event) => setItemForm((prev) => ({ ...prev, unitPrice: Number(event.value ?? 0) }))}
                />
              </label>
              <div className="flex items-end gap-2 sm:col-span-2">
                <Button
                  type="submit"
                  label={editingItem ? 'Lưu' : 'Thêm'}
                  icon={editingItem ? 'pi pi-save' : 'pi pi-plus'}
                  loading={isSaving}
                  disabled={!canWrite || detailIsLocked}
                />
                {editingItem && (
                  <Button type="button" icon="pi pi-times" severity="secondary" outlined onClick={resetItemForm} />
                )}
              </div>
            </form>

            <DataTable
              value={selectedWorkOrder.items}
              dataKey="id"
              emptyMessage="Chưa có hạng mục"
              tableStyle={{ minWidth: '54rem' }}
            >
              <Column field="description" header="Hạng mục" />
              <Column field="quantity" header="SL" />
              <Column header="Đơn giá" body={(row: WorkOrderItem) => formatMoney(Number(row.unitPrice))} />
              <Column header="Thành tiền" body={(row: WorkOrderItem) => formatMoney(Number(row.amount))} />
              <Column
                header="Thao tác"
                body={(row: WorkOrderItem) => (
                  <div className="flex gap-2">
                    <Button
                      icon="pi pi-pencil"
                      rounded
                      text
                      aria-label={`Sửa hạng mục ${row.description}`}
                      disabled={!canWrite || detailIsLocked}
                      onClick={() => openEditItem(row)}
                    />
                    <Button
                      icon="pi pi-trash"
                      rounded
                      text
                      severity="danger"
                      aria-label={`Xóa hạng mục ${row.description}`}
                      disabled={!canWrite || detailIsLocked}
                      onClick={() => void handleDeleteItem(row)}
                    />
                  </div>
                )}
              />
            </DataTable>

            <div className="flex justify-end text-base font-semibold text-gray-800">
              Tổng tạm tính: {formatMoney(totalAmount)}
            </div>

            <div className="border-t border-gray-200 pt-5">
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-gray-800">Phụ tùng sử dụng</h2>
                <p className="text-sm text-gray-500">Ghi nhận phụ tùng theo hạng mục và đồng bộ tồn kho.</p>
              </div>

              <form
                className="mb-4 grid gap-3 sm:grid-cols-2"
                onSubmit={handleSavePartUsage}
              >
                <div className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  <label htmlFor="part-usage-item">Hạng mục</label>
                  <Dropdown
                    inputId="part-usage-item"
                    value={partUsageForm.workOrderItemId}
                    options={workOrderItemOptions}
                    disabled={detailIsLocked || Boolean(editingPartUsage)}
                    onChange={(event) =>
                      setPartUsageForm((previous) => ({
                        ...previous,
                        workOrderItemId: event.value as string,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  <label htmlFor="part-usage-part">Phụ tùng</label>
                  <Dropdown
                    inputId="part-usage-part"
                    value={partUsageForm.partId}
                    options={partOptions}
                    filter
                    disabled={detailIsLocked}
                    onChange={(event) => handlePartSelect(event.value as string)}
                  />
                </div>
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  SL phụ tùng
                  <InputNumber
                    value={partUsageForm.quantity}
                    min={1}
                    useGrouping={false}
                    disabled={detailIsLocked}
                    inputClassName="w-full"
                    onValueChange={(event) =>
                      setPartUsageForm((previous) => ({
                        ...previous,
                        quantity: Number(event.value ?? 1),
                      }))
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Giá phụ tùng
                  <InputNumber
                    value={partUsageForm.unitPrice}
                    min={0}
                    useGrouping={false}
                    disabled={detailIsLocked}
                    inputClassName="w-full"
                    onValueChange={(event) =>
                      setPartUsageForm((previous) => ({
                        ...previous,
                        unitPrice: Number(event.value ?? 0),
                      }))
                    }
                  />
                </label>
                <div className="flex items-end gap-2 sm:col-span-2">
                  <Button
                    type="submit"
                    label={editingPartUsage ? 'Lưu' : 'Ghi nhận'}
                    icon={editingPartUsage ? 'pi pi-save' : 'pi pi-plus'}
                    loading={isSaving}
                    disabled={
                      !canManageParts ||
                      detailIsLocked ||
                      !partUsageForm.workOrderItemId ||
                      !partUsageForm.partId
                    }
                  />
                  {editingPartUsage && (
                    <Button
                      type="button"
                      icon="pi pi-times"
                      severity="secondary"
                      outlined
                      aria-label="Hủy sửa phụ tùng"
                      onClick={resetPartUsageForm}
                    />
                  )}
                </div>
              </form>

              <DataTable
                value={partUsageRows}
                dataKey="id"
                emptyMessage="Chưa ghi nhận phụ tùng"
                tableStyle={{ minWidth: '58rem' }}
              >
                <Column field="workOrderItemDescription" header="Hạng mục" />
                <Column field="part.partNumber" header="Mã phụ tùng" />
                <Column field="part.name" header="Phụ tùng" />
                <Column field="quantity" header="SL" />
                <Column
                  header="Đơn giá"
                  body={(row: PartUsageRow) => formatMoney(Number(row.unitPrice))}
                />
                <Column
                  header="Thành tiền"
                  body={(row: PartUsageRow) => formatMoney(Number(row.unitPrice) * row.quantity)}
                />
                <Column
                  header="Thao tác"
                  body={(row: PartUsageRow) => (
                    <div className="flex gap-2">
                      <Button
                        icon="pi pi-pencil"
                        rounded
                        text
                        aria-label={`Sửa phụ tùng ${row.part.partNumber}`}
                        disabled={!canManageParts || detailIsLocked}
                        onClick={() => openEditPartUsage(row)}
                      />
                      <Button
                        icon="pi pi-trash"
                        rounded
                        text
                        severity="danger"
                        aria-label={`Xóa phụ tùng ${row.part.partNumber}`}
                        disabled={!canManageParts || detailIsLocked}
                        onClick={() => void handleDeletePartUsage(row)}
                      />
                    </div>
                  )}
                />
              </DataTable>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function statusLabel(status: WorkOrderStatus): string {
  return statusOptions.find((option) => option.value === status)?.label ?? status;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatMoney(value: number): string {
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
