import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { customerApi, type Customer } from '../customers/customerApi';
import { vehicleApi, type Vehicle } from '../vehicles/vehicleApi';
import {
  maintenanceHistoryApi,
  type MaintenanceHistoryEntry,
  type MaintenanceHistoryItem,
  type MaintenanceHistoryPartUsage,
  type MaintenanceHistoryPayment,
} from './maintenanceHistoryApi';

const currencyFormatter = new Intl.NumberFormat('vi-VN');

const paymentMethodLabels: Record<string, string> = {
  Cash: 'Tiền mặt',
  BankTransfer: 'Chuyển khoản',
  Card: 'Thẻ',
};

export function MaintenanceHistoryPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [entries, setEntries] = useState<MaintenanceHistoryEntry[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [search, setSearch] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<MaintenanceHistoryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredVehicles = useMemo(
    () => vehicles.filter((vehicle) => !customerId || vehicle.customerId === customerId),
    [customerId, vehicles],
  );

  const loadFilters = async () => {
    setError(null);
    try {
      const [customerRows, vehicleRows] = await Promise.all([customerApi.list(), vehicleApi.list()]);
      setCustomers(customerRows);
      setVehicles(vehicleRows);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được dữ liệu khách hàng và xe'));
    }
  };

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rows = await maintenanceHistoryApi.list({
        customerId: customerId || undefined,
        vehicleId: vehicleId || undefined,
        search: search.trim() || undefined,
      });
      setEntries(rows);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được lịch sử bảo dưỡng'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadFilters();
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [customerId, vehicleId]);

  const handleCustomerChange = (value: string) => {
    setCustomerId(value);
    setVehicleId('');
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadHistory();
  };

  const resetFilters = () => {
    setCustomerId('');
    setVehicleId('');
    setSearch('');
  };

  const totalAmount = (entry: MaintenanceHistoryEntry) => Number(entry.invoice?.totalAmount ?? 0);
  const serviceCount = (entry: MaintenanceHistoryEntry) => entry.items.length;
  const partCount = (entry: MaintenanceHistoryEntry) =>
    entry.items.reduce((sum, item) => sum + item.partUsages.length, 0);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Lịch sử bảo dưỡng</h1>
          <p className="text-sm text-gray-500">Tra cứu các lần sửa chữa đã giao xe theo khách hàng hoặc phương tiện.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Message severity="error" text={error} />
        </div>
      )}

      <form onSubmit={handleSearch} className="filter-panel lg:grid-cols-[1fr_1fr_1.4fr_auto]">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Khách hàng
          <select
            className="p-inputtext w-full"
            value={customerId}
            onChange={(event) => handleCustomerChange(event.target.value)}
          >
            <option value="">Tất cả khách hàng</option>
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
            value={vehicleId}
            onChange={(event) => setVehicleId(event.target.value)}
          >
            <option value="">Tất cả phương tiện</option>
            {filteredVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Tìm kiếm
          <InputText
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Biển số, khách hàng, SĐT"
          />
        </label>
        <div className="filter-actions">
          <Button type="submit" label="Tìm" icon="pi pi-search" loading={isLoading} />
          <Button type="button" icon="pi pi-filter-slash" severity="secondary" aria-label="Xóa lọc" onClick={resetFilters} />
        </div>
      </form>

      <div className="page-table-surface">
        <DataTable
          value={entries}
          dataKey="id"
          loading={isLoading}
          paginator
          rows={10}
          emptyMessage="Chưa có lịch sử bảo dưỡng phù hợp"
          tableStyle={{ minWidth: '72rem' }}
        >
          <Column header="Ngày giao" body={(row: MaintenanceHistoryEntry) => formatDate(row.deliveredAt ?? row.updatedAt)} sortable />
          <Column field="vehicle.licensePlate" header="Biển số" sortable />
          <Column header="Xe" body={(row: MaintenanceHistoryEntry) => `${row.vehicle.make} ${row.vehicle.model} (${row.vehicle.year})`} />
          <Column header="Khách hàng" body={(row: MaintenanceHistoryEntry) => row.vehicle.customer.fullName} sortable />
          <Column header="Dịch vụ" body={serviceCount} />
          <Column header="Phụ tùng" body={partCount} />
          <Column header="Tổng tiền" body={(row: MaintenanceHistoryEntry) => formatCurrency(totalAmount(row))} sortable />
          <Column
            header="Thanh toán"
            body={(row: MaintenanceHistoryEntry) => (
              <Tag
                value={row.invoice?.status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                severity={row.invoice?.status === 'Paid' ? 'success' : 'warning'}
              />
            )}
          />
          <Column
            header=""
            body={(row: MaintenanceHistoryEntry) => (
              <Button
                icon="pi pi-eye"
                text
                rounded
                aria-label={`Xem lịch sử ${row.vehicle.licensePlate}`}
                onClick={() => setSelectedEntry(row)}
              />
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header={selectedEntry ? `Lịch sử ${selectedEntry.vehicle.licensePlate}` : 'Chi tiết lịch sử'}
        visible={!!selectedEntry}
        style={{ width: 'min(64rem, 96vw)' }}
        modal
        onHide={() => setSelectedEntry(null)}
      >
        {selectedEntry && (
          <div className="space-y-5 text-sm text-gray-700">
            <div className="grid gap-3 rounded-md border border-gray-200 p-4 md:grid-cols-3">
              <Info label="Khách hàng" value={`${selectedEntry.vehicle.customer.fullName} - ${selectedEntry.vehicle.customer.phone}`} />
              <Info label="Phương tiện" value={`${selectedEntry.vehicle.make} ${selectedEntry.vehicle.model} ${selectedEntry.vehicle.year}`} />
              <Info label="Ngày giao" value={formatDate(selectedEntry.deliveredAt ?? selectedEntry.updatedAt)} />
              <Info label="Chẩn đoán" value={selectedEntry.diagnosis || 'Không có'} />
              <Info label="Số dịch vụ" value={String(serviceCount(selectedEntry))} />
              <Info label="Tổng tiền" value={formatCurrency(totalAmount(selectedEntry))} />
            </div>

            <section>
              <h2 className="mb-2 text-base font-semibold text-gray-800">Dịch vụ</h2>
              <DataTable value={selectedEntry.items} dataKey="id" emptyMessage="Chưa có dịch vụ" tableStyle={{ minWidth: '42rem' }}>
                <Column field="description" header="Mô tả" />
                <Column header="SL" body={(row: MaintenanceHistoryItem) => row.quantity} />
                <Column header="Đơn giá" body={(row: MaintenanceHistoryItem) => formatCurrency(Number(row.unitPrice))} />
                <Column header="Thành tiền" body={(row: MaintenanceHistoryItem) => formatCurrency(Number(row.amount))} />
              </DataTable>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-gray-800">Phụ tùng</h2>
              <DataTable
                value={selectedEntry.items.flatMap((item) => item.partUsages)}
                dataKey="id"
                emptyMessage="Chưa có phụ tùng"
                tableStyle={{ minWidth: '42rem' }}
              >
                <Column header="Mã" body={(row: MaintenanceHistoryPartUsage) => row.part.partNumber} />
                <Column header="Tên phụ tùng" body={(row: MaintenanceHistoryPartUsage) => row.part.name} />
                <Column header="SL" body={(row: MaintenanceHistoryPartUsage) => `${row.quantity} ${row.part.unit}`} />
                <Column header="Đơn giá" body={(row: MaintenanceHistoryPartUsage) => formatCurrency(Number(row.unitPrice))} />
              </DataTable>
            </section>

            <section>
              <h2 className="mb-2 text-base font-semibold text-gray-800">Thanh toán</h2>
              <DataTable
                value={selectedEntry.invoice?.payments ?? []}
                dataKey="id"
                emptyMessage="Chưa có thanh toán"
                tableStyle={{ minWidth: '42rem' }}
              >
                <Column header="Thời gian" body={(row: MaintenanceHistoryPayment) => formatDateTime(row.paidAt)} />
                <Column header="Số tiền" body={(row: MaintenanceHistoryPayment) => formatCurrency(Number(row.amount))} />
                <Column header="Phương thức" body={(row: MaintenanceHistoryPayment) => paymentMethodLabels[row.method]} />
                <Column header="Mã giao dịch" body={(row: MaintenanceHistoryPayment) => row.transactionRef || '-'} />
              </DataTable>
            </section>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase text-gray-500">{label}</div>
      <div className="mt-1 font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function formatCurrency(value: number) {
  return `${currencyFormatter.format(value)} đ`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('vi-VN');
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('vi-VN');
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
