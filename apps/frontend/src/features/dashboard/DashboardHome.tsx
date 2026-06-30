import { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { appointmentApi } from '../appointments/appointmentApi';
import { invoiceApi } from '../invoices/invoiceApi';
import { workOrderApi } from '../work-orders/workOrderApi';

const activeWorkOrderStatuses = new Set(['Diagnosing', 'Repairing', 'WaitingParts']);
const currencyFormatter = new Intl.NumberFormat('vi-VN');

export function DashboardHome() {
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [activeWorkOrders, setActiveWorkOrders] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cards = useMemo(
    () => [
      {
        label: 'Lịch hẹn hôm nay',
        value: isLoading ? '...' : String(todayAppointments),
        icon: 'pi-calendar',
        color: 'bg-sky-600',
      },
      {
        label: 'Xe đang sửa chữa',
        value: isLoading ? '...' : String(activeWorkOrders),
        icon: 'pi-car',
        color: 'bg-amber-600',
      },
      {
        label: 'Hoàn thành hôm nay',
        value: isLoading ? '...' : String(completedToday),
        icon: 'pi-check-circle',
        color: 'bg-emerald-600',
      },
      {
        label: 'Doanh thu tháng',
        value: isLoading ? '...' : formatMoney(monthlyRevenue),
        icon: 'pi-dollar',
        color: 'bg-indigo-600',
      },
    ],
    [activeWorkOrders, completedToday, isLoading, monthlyRevenue, todayAppointments],
  );

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const now = new Date();
      const todayStart = startOfDay(now);
      const tomorrowStart = addDays(todayStart, 1);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [appointments, workOrders, invoices] = await Promise.all([
        appointmentApi.list({
          from: todayStart.toISOString(),
          to: tomorrowStart.toISOString(),
        }),
        workOrderApi.list(),
        invoiceApi.list(),
      ]);

      setTodayAppointments(appointments.length);
      setActiveWorkOrders(
        workOrders.filter((workOrder) => activeWorkOrderStatuses.has(workOrder.status)).length,
      );
      setCompletedToday(
        workOrders.filter(
          (workOrder) =>
            workOrder.status === 'Delivered' &&
            workOrder.deliveredAt &&
            isSameLocalDate(new Date(workOrder.deliveredAt), now),
        ).length,
      );
      setMonthlyRevenue(
        invoices.reduce((sum, invoice) => {
          const paidThisMonth = invoice.payments
            .filter((payment) => {
              const paidAt = new Date(payment.paidAt);
              return paidAt >= monthStart && paidAt <= now;
            })
            .reduce((paymentSum, payment) => paymentSum + Number(payment.amount), 0);
          return sum + paidThisMonth;
        }, 0),
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Không tải được dữ liệu tổng quan'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Tổng quan</h1>
          <p className="text-sm text-gray-500">Theo dõi nhanh lịch hẹn, tiến độ sửa chữa và doanh thu hiện tại.</p>
        </div>
        <Button
          label="Cập nhật"
          icon="pi pi-refresh"
          className="page-create-button"
          onClick={() => void loadDashboard()}
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="mb-4">
          <Message severity="error" text={error} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="metric-card">
            <div className={`${card.color} flex h-12 w-12 shrink-0 items-center justify-center rounded-md`}>
              <i className={`pi ${card.icon} text-white text-xl`} />
            </div>
            <div className="min-w-0">
              <div className="break-words text-2xl font-bold text-gray-800">{card.value}</div>
              <div className="text-sm text-gray-500">{card.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function startOfDay(value: Date) {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function isSameLocalDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatMoney(value: number) {
  return `${currencyFormatter.format(value)} đ`;
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
