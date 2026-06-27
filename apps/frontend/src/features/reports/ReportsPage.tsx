import { type FormEvent, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  reportApi,
  type LowStockReportRow,
  type RevenueReport,
  type TopPartReportRow,
  type TopServiceReportRow,
  type WorkOrderReport,
} from './reportApi';

const statusLabels: Record<string, string> = {
  Received: 'Tiếp nhận',
  Diagnosing: 'Chẩn đoán',
  Repairing: 'Đang sửa',
  WaitingParts: 'Chờ phụ tùng',
  ReadyForDelivery: 'Sẵn sàng giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã hủy',
};

const currencyFormatter = new Intl.NumberFormat('vi-VN');

export function ReportsPage() {
  const [from, setFrom] = useState(toDateInputValue(addDays(new Date(), -30)));
  const [to, setTo] = useState(toDateInputValue(new Date()));
  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrderReport | null>(null);
  const [topServices, setTopServices] = useState<TopServiceReportRow[]>([]);
  const [topParts, setTopParts] = useState<TopPartReportRow[]>([]);
  const [lowStock, setLowStock] = useState<LowStockReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        from: from || undefined,
        to: to || undefined,
        limit: 5,
      };
      const [revenueRows, workOrderRows, serviceRows, partRows, lowStockRows] = await Promise.all([
        reportApi.revenue(params),
        reportApi.workOrders(params),
        reportApi.topServices(params),
        reportApi.topParts(params),
        reportApi.lowStock(),
      ]);
      setRevenue(revenueRows);
      setWorkOrders(workOrderRows);
      setTopServices(serviceRows);
      setTopParts(partRows);
      setLowStock(lowStockRows);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được báo cáo'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadReports();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Báo cáo</h1>
          <p className="text-sm text-gray-500">Theo dõi doanh thu, khối lượng phiếu và hiệu quả dịch vụ/phụ tùng.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Message severity="error" text={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-4 grid gap-3 bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_auto]">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Từ ngày
          <InputText type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Đến ngày
          <InputText type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </label>
        <div className="flex items-end">
          <Button type="submit" label="Cập nhật" icon="pi pi-refresh" loading={isLoading} />
        </div>
      </form>

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <Metric title="Doanh thu" value={formatMoney(revenue?.totalRevenue ?? 0)} icon="pi pi-wallet" />
        <Metric title="Thanh toán" value={String(revenue?.paymentCount ?? 0)} icon="pi pi-credit-card" />
        <Metric title="Phiếu sửa chữa" value={String(workOrders?.total ?? 0)} icon="pi pi-clipboard" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-800">Doanh thu theo ngày</h2>
          <DataTable
            value={revenue?.series ?? []}
            loading={isLoading}
            dataKey="date"
            emptyMessage="Chưa có doanh thu trong khoảng này"
            tableStyle={{ minWidth: '28rem' }}
          >
            <Column header="Ngày" body={(row: { date: string }) => formatDate(row.date)} sortable />
            <Column header="Doanh thu" body={(row: { amount: number }) => formatMoney(row.amount)} sortable />
          </DataTable>
        </section>

        <section className="bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-800">Phiếu theo trạng thái</h2>
          <DataTable
            value={workOrders?.counts ?? []}
            loading={isLoading}
            dataKey="status"
            emptyMessage="Chưa có phiếu sửa chữa"
            tableStyle={{ minWidth: '28rem' }}
          >
            <Column header="Trạng thái" body={(row: { status: string }) => statusLabels[row.status]} />
            <Column field="count" header="Số lượng" sortable />
          </DataTable>
        </section>

        <section className="bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-800">Top dịch vụ</h2>
          <DataTable
            value={topServices}
            loading={isLoading}
            dataKey="serviceId"
            emptyMessage="Chưa có dữ liệu dịch vụ"
            tableStyle={{ minWidth: '36rem' }}
          >
            <Column field="name" header="Dịch vụ" />
            <Column field="quantity" header="SL" sortable />
            <Column header="Doanh thu" body={(row: TopServiceReportRow) => formatMoney(row.revenue)} sortable />
          </DataTable>
        </section>

        <section className="bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-800">Top phụ tùng</h2>
          <DataTable
            value={topParts}
            loading={isLoading}
            dataKey="partId"
            emptyMessage="Chưa có dữ liệu phụ tùng"
            tableStyle={{ minWidth: '36rem' }}
          >
            <Column field="partNumber" header="Mã" />
            <Column field="name" header="Phụ tùng" />
            <Column field="quantity" header="SL" sortable />
            <Column header="Doanh thu" body={(row: TopPartReportRow) => formatMoney(row.revenue)} sortable />
          </DataTable>
        </section>
      </div>

      <section className="mt-4 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-gray-800">Tồn kho thấp</h2>
        <DataTable
          value={lowStock}
          loading={isLoading}
          dataKey="id"
          emptyMessage="Không có phụ tùng tồn thấp"
          tableStyle={{ minWidth: '48rem' }}
        >
          <Column field="partNumber" header="Mã phụ tùng" />
          <Column field="name" header="Tên phụ tùng" />
          <Column header="Tồn" body={(row: LowStockReportRow) => `${row.stockQuantity} ${row.unit}`} sortable />
          <Column field="reorderLevel" header="Ngưỡng đặt lại" sortable />
          <Column body={() => <Tag value="Tồn thấp" severity="warning" />} />
        </DataTable>
      </section>
    </div>
  );
}

function Metric({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 bg-white p-4 shadow-sm">
      <span className="flex h-11 w-11 items-center justify-center rounded bg-primary-50 text-primary-700">
        <i className={icon} />
      </span>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-xl font-bold text-gray-800">{value}</div>
      </div>
    </div>
  );
}

function formatMoney(value: number) {
  return `${currencyFormatter.format(value)} đ`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('vi-VN');
}

function toDateInputValue(value: Date) {
  return value.toISOString().slice(0, 10);
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
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
