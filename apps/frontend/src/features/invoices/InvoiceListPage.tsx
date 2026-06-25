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
import { workOrderApi, type WorkOrder } from '../work-orders/workOrderApi';
import { invoiceApi, type Invoice } from './invoiceApi';

interface InvoiceFormState {
  workOrderId: string;
  discount: number;
  tax: number;
  notes: string;
}

const emptyForm: InvoiceFormState = {
  workOrderId: '',
  discount: 0,
  tax: 0,
  notes: '',
};

export function InvoiceListPage() {
  const currentUser = useSelector(selectCurrentUser);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState<InvoiceFormState>(emptyForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canCreate = currentUser?.role === 'Admin' || currentUser?.role === 'Cashier';
  const invoicedWorkOrderIds = useMemo(
    () => new Set(invoices.map((invoice) => invoice.workOrderId)),
    [invoices],
  );
  const eligibleWorkOrders = useMemo(
    () =>
      workOrders.filter(
        (workOrder) =>
          workOrder.status === 'ReadyForDelivery' && !invoicedWorkOrderIds.has(workOrder.id),
      ),
    [invoicedWorkOrderIds, workOrders],
  );
  const filteredInvoices = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const matchesStatus = !statusFilter || invoice.status === statusFilter;
      const matchesKeyword =
        !keyword ||
        [
          invoice.workOrder.vehicle.licensePlate,
          invoice.workOrder.vehicle.customer.fullName,
          invoice.workOrder.vehicle.customer.phone,
          invoice.workOrder.vehicle.customer.companyName,
          invoice.id,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));
      return matchesStatus && matchesKeyword;
    });
  }, [invoices, search, statusFilter]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [invoiceRows, workOrderRows] = await Promise.all([
        invoiceApi.list(),
        workOrderApi.list(),
      ]);
      setInvoices(invoiceRows);
      setWorkOrders(workOrderRows);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được danh sách hóa đơn'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const openCreateDialog = () => {
    setForm({
      ...emptyForm,
      workOrderId: eligibleWorkOrders[0]?.id ?? '',
    });
    setError(null);
    setCreateOpen(true);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const invoice = await invoiceApi.create({
        workOrderId: form.workOrderId,
        discount: form.discount,
        tax: form.tax,
        notes: form.notes || null,
      });
      setSuccess('Đã lập hóa đơn');
      setCreateOpen(false);
      await loadData();
      setSelectedInvoice(invoice);
      setDetailOpen(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không lập được hóa đơn'));
    } finally {
      setIsSaving(false);
    }
  };

  const openDetailDialog = async (invoice: Invoice) => {
    setError(null);
    try {
      setSelectedInvoice(await invoiceApi.get(invoice.id));
      setDetailOpen(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được chi tiết hóa đơn'));
    }
  };

  const subtotal =
    selectedInvoice?.lines.reduce((sum, line) => sum + Number(line.amount), 0) ?? 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Hóa đơn</h1>
          <p className="text-sm text-gray-500">Lập hóa đơn snapshot từ phiếu sửa chữa đã hoàn tất kỹ thuật.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={search}
              placeholder="Tìm hóa đơn"
              className="w-full sm:w-64"
              onChange={(event) => setSearch(event.target.value)}
            />
          </span>
          <select
            aria-label="Lọc trạng thái hóa đơn"
            className="p-inputtext w-full sm:w-44"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Unpaid">Chưa thanh toán</option>
            <option value="Paid">Đã thanh toán</option>
          </select>
          <Button
            label="Lập hóa đơn"
            icon="pi pi-receipt"
            disabled={!canCreate || eligibleWorkOrders.length === 0}
            onClick={openCreateDialog}
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

      <div className="overflow-x-auto bg-white shadow-sm">
        <DataTable
          value={filteredInvoices}
          loading={isLoading}
          dataKey="id"
          paginator
          rows={10}
          emptyMessage="Chưa có hóa đơn phù hợp"
          tableStyle={{ minWidth: '68rem' }}
        >
          <Column
            header="Mã hóa đơn"
            body={(row: Invoice) => shortId(row.id)}
          />
          <Column field="workOrder.vehicle.licensePlate" header="Biển số" sortable />
          <Column field="workOrder.vehicle.customer.fullName" header="Khách hàng" sortable />
          <Column
            header="Ngày lập"
            body={(row: Invoice) => formatDateTime(row.issuedAt)}
            sortable
          />
          <Column
            header="Tổng tiền"
            body={(row: Invoice) => formatMoney(Number(row.totalAmount))}
            sortable
          />
          <Column
            header="Trạng thái"
            body={(row: Invoice) => (
              <Tag
                value={row.status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                severity={row.status === 'Paid' ? 'success' : 'warning'}
              />
            )}
          />
          <Column
            header="Thao tác"
            body={(row: Invoice) => (
              <Button
                icon="pi pi-eye"
                rounded
                text
                aria-label={`Xem hóa đơn ${row.workOrder.vehicle.licensePlate}`}
                onClick={() => void openDetailDialog(row)}
              />
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header="Lập hóa đơn"
        visible={createOpen}
        className="w-[min(94vw,680px)]"
        onHide={() => setCreateOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleCreate}>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Phiếu sửa chữa
            <select
              className="p-inputtext w-full"
              value={form.workOrderId}
              required
              onChange={(event) =>
                setForm((previous) => ({ ...previous, workOrderId: event.target.value }))
              }
            >
              {eligibleWorkOrders.map((workOrder) => (
                <option key={workOrder.id} value={workOrder.id}>
                  {workOrder.vehicle.licensePlate} - {workOrder.vehicle.customer.fullName}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label
              htmlFor="invoice-discount"
              className="flex flex-col gap-1 text-sm font-medium text-gray-700"
            >
              Giảm giá
              <InputNumber
                value={form.discount}
                min={0}
                useGrouping={false}
                inputId="invoice-discount"
                onValueChange={(event) =>
                  setForm((previous) => ({ ...previous, discount: Number(event.value ?? 0) }))
                }
              />
            </label>
            <label
              htmlFor="invoice-tax"
              className="flex flex-col gap-1 text-sm font-medium text-gray-700"
            >
              Thuế
              <InputNumber
                value={form.tax}
                min={0}
                useGrouping={false}
                inputId="invoice-tax"
                onValueChange={(event) =>
                  setForm((previous) => ({ ...previous, tax: Number(event.value ?? 0) }))
                }
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Ghi chú hóa đơn
            <InputTextarea
              value={form.notes}
              rows={3}
              onChange={(event) => setForm((previous) => ({ ...previous, notes: event.target.value }))}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" label="Hủy" severity="secondary" text onClick={() => setCreateOpen(false)} />
            <Button type="submit" label="Xác nhận lập" icon="pi pi-check" loading={isSaving} />
          </div>
        </form>
      </Dialog>

      <Dialog
        header={selectedInvoice ? `Hóa đơn ${shortId(selectedInvoice.id)}` : 'Chi tiết hóa đơn'}
        visible={detailOpen}
        className="w-[min(96vw,900px)]"
        onHide={() => setDetailOpen(false)}
      >
        {selectedInvoice && (
          <div className="space-y-5">
            <div className="grid gap-3 bg-gray-50 p-4 text-sm md:grid-cols-3">
              <div>
                <div className="text-gray-500">Khách hàng</div>
                <strong>{selectedInvoice.workOrder.vehicle.customer.fullName}</strong>
              </div>
              <div>
                <div className="text-gray-500">Phương tiện</div>
                <strong>
                  {selectedInvoice.workOrder.vehicle.licensePlate} -{' '}
                  {selectedInvoice.workOrder.vehicle.make} {selectedInvoice.workOrder.vehicle.model}
                </strong>
              </div>
              <div>
                <div className="text-gray-500">Ngày lập</div>
                <strong>{formatDateTime(selectedInvoice.issuedAt)}</strong>
              </div>
            </div>

            <DataTable value={selectedInvoice.lines} dataKey="id" tableStyle={{ minWidth: '48rem' }}>
              <Column field="description" header="Nội dung" />
              <Column field="quantity" header="SL" />
              <Column
                header="Đơn giá"
                body={(row) => formatMoney(Number(row.unitPrice))}
              />
              <Column
                header="Thành tiền"
                body={(row) => formatMoney(Number(row.amount))}
              />
            </DataTable>

            <div className="ml-auto grid max-w-sm gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tạm tính</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Giảm giá</span>
                <span>-{formatMoney(Number(selectedInvoice.discount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Thuế</span>
                <span>+{formatMoney(Number(selectedInvoice.tax))}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
                <span>Tổng cộng</span>
                <span>{formatMoney(Number(selectedInvoice.totalAmount))}</span>
              </div>
            </div>

            {selectedInvoice.notes && (
              <div className="text-sm">
                <span className="text-gray-500">Ghi chú: </span>
                {selectedInvoice.notes}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}

function shortId(id: string) {
  return `INV-${id.slice(0, 8).toUpperCase()}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function getErrorMessage(error: unknown, fallback: string) {
  return (
    (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
      ?.message ?? fallback
  );
}
