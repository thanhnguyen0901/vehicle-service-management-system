import { expect, test, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

const currencyFormatter = new Intl.NumberFormat('vi-VN');

test('admin dashboard renders real KPI data from APIs', async ({ page }) => {
  test.setTimeout(60_000);
  const suffix = Date.now();
  const customerName = `E2E Dashboard Owner ${suffix}`;
  const customerPhone = `02${String(suffix).slice(-8)}`;
  const licensePlate = `DSH-${String(suffix).slice(-5)}`;
  const serviceName = `E2E Dashboard Service ${suffix}`;

  await loginAsAdmin(page);

  const customer = await postJson<{ id: string }>(page, '/api/v1/customers', {
    fullName: customerName,
    phone: customerPhone,
    type: 'Individual',
  });
  const vehicle = await postJson<{ id: string }>(page, '/api/v1/vehicles', {
    customerId: customer.id,
    licensePlate,
    make: 'Kia',
    model: 'Seltos',
    year: 2024,
  });

  const scheduledAt = new Date();
  scheduledAt.setHours(scheduledAt.getHours() + 1, 0, 0, 0);
  await postJson(page, '/api/v1/appointments', {
    vehicleId: vehicle.id,
    scheduledAt: scheduledAt.toISOString(),
    serviceNote: 'Dashboard KPI appointment',
  });

  await postJson(page, '/api/v1/work-orders', {
    vehicleId: vehicle.id,
    diagnosis: 'Dashboard active work order',
  });

  const service = await postJson<{ id: string }>(page, '/api/v1/services', {
    name: serviceName,
    unitPrice: 1234567,
    durationMin: 30,
  });
  const billableWorkOrder = await postJson<{ id: string }>(page, '/api/v1/work-orders', {
    vehicleId: vehicle.id,
    diagnosis: 'Dashboard revenue work order',
  });
  await postJson(page, `/api/v1/work-orders/${billableWorkOrder.id}/items`, {
    serviceId: service.id,
    description: serviceName,
    quantity: 1,
    unitPrice: 1234567,
  });
  for (const status of ['Diagnosing', 'Repairing', 'ReadyForDelivery']) {
    await patchJson(page, `/api/v1/work-orders/${billableWorkOrder.id}/status`, { status });
  }
  const invoice = await postJson<{ id: string }>(page, '/api/v1/invoices', {
    workOrderId: billableWorkOrder.id,
    discount: 0,
    tax: 0,
  });
  await postJson(page, `/api/v1/invoices/${invoice.id}/payments`, {
    amount: 1234567,
    method: 'Cash',
  });
  await patchJson(page, `/api/v1/work-orders/${billableWorkOrder.id}/status`, { status: 'Delivered' });

  const expected = await getExpectedDashboard(page);
  await page.goto('/dashboard');

  await expect(page.getByRole('heading', { name: 'Tổng quan' })).toBeVisible();
  await expect(metric(page, 'Lịch hẹn hôm nay')).toContainText(String(expected.todayAppointments));
  await expect(metric(page, 'Xe đang sửa chữa')).toContainText(String(expected.activeWorkOrders));
  await expect(metric(page, 'Hoàn thành hôm nay')).toContainText(String(expected.completedToday));
  await expect(metric(page, 'Doanh thu tháng')).toContainText(formatMoney(expected.monthlyRevenue));
});

function metric(page: Page, label: string) {
  return page.getByText(label).locator('..');
}

async function getExpectedDashboard(page: Page) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [appointmentsResponse, workOrdersResponse, invoicesResponse] = await Promise.all([
    page.request.get('/api/v1/appointments', {
      params: {
        from: todayStart.toISOString(),
        to: tomorrowStart.toISOString(),
      },
    }),
    page.request.get('/api/v1/work-orders'),
    page.request.get('/api/v1/invoices'),
  ]);
  expect(appointmentsResponse.ok()).toBeTruthy();
  expect(workOrdersResponse.ok()).toBeTruthy();
  expect(invoicesResponse.ok()).toBeTruthy();

  const appointments = (await appointmentsResponse.json()) as unknown[];
  const workOrders = (await workOrdersResponse.json()) as Array<{
    status: string;
    deliveredAt: string | null;
  }>;
  const invoices = (await invoicesResponse.json()) as Array<{
    payments: Array<{ amount: string; paidAt: string }>;
  }>;

  return {
    todayAppointments: appointments.length,
    activeWorkOrders: workOrders.filter((workOrder) =>
      ['Diagnosing', 'Repairing', 'WaitingParts'].includes(workOrder.status),
    ).length,
    completedToday: workOrders.filter(
      (workOrder) =>
        workOrder.status === 'Delivered' &&
        workOrder.deliveredAt &&
        isSameLocalDate(new Date(workOrder.deliveredAt), now),
    ).length,
    monthlyRevenue: invoices.reduce(
      (sum, invoice) =>
        sum +
        invoice.payments
          .filter((payment) => {
            const paidAt = new Date(payment.paidAt);
            return paidAt >= monthStart && paidAt <= now;
          })
          .reduce((paymentSum, payment) => paymentSum + Number(payment.amount), 0),
      0,
    ),
  };
}

async function postJson<T = unknown>(page: Page, url: string, data: unknown): Promise<T> {
  const response = await page.request.post(url, { data });
  expect(response.ok()).toBeTruthy();
  return response.json() as Promise<T>;
}

async function patchJson<T = unknown>(page: Page, url: string, data: unknown): Promise<T> {
  const response = await page.request.patch(url, { data });
  expect(response.ok()).toBeTruthy();
  return response.json() as Promise<T>;
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
