import { expect, test, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('admin can view real revenue, top item and low stock reports', async ({ page }) => {
  test.setTimeout(60_000);
  const suffix = Date.now();
  const customerName = `E2E Report Owner ${suffix}`;
  const customerPhone = `05${String(suffix).slice(-8)}`;
  const licensePlate = `RPT-${String(suffix).slice(-5)}`;
  const serviceName = `E2E Report Premium Service ${suffix}`;
  const partNumber = `RPT-PART-${String(suffix).slice(-5)}`;
  const partName = `E2E Report Filter ${suffix}`;

  await loginAsAdmin(page);

  const customer = await postJson<{ id: string }>(page, '/api/v1/customers', {
    fullName: customerName,
    phone: customerPhone,
    type: 'Individual',
  });
  const vehicle = await postJson<{ id: string }>(page, '/api/v1/vehicles', {
    customerId: customer.id,
    licensePlate,
    make: 'Mazda',
    model: 'CX-5',
    year: 2024,
  });
  const service = await postJson<{ id: string }>(page, '/api/v1/services', {
    name: serviceName,
    unitPrice: 90000000,
    durationMin: 120,
  });
  const part = await postJson<{ id: string }>(page, '/api/v1/parts', {
    partNumber,
    name: partName,
    unit: 'piece',
    unitCost: 8000000,
    unitPrice: 12000000,
    stockQuantity: 2,
    reorderLevel: 5,
  });
  const workOrder = await postJson<{ id: string }>(page, '/api/v1/work-orders', {
    vehicleId: vehicle.id,
    diagnosis: 'Report data setup',
  });
  const item = await postJson<{ id: string }>(page, `/api/v1/work-orders/${workOrder.id}/items`, {
    serviceId: service.id,
    description: serviceName,
    quantity: 1,
    unitPrice: 90000000,
  });
  await postJson(page, `/api/v1/work-orders/${workOrder.id}/part-usages`, {
    workOrderItemId: item.id,
    partId: part.id,
    quantity: 2,
    unitPrice: 12000000,
  });
  for (const status of ['Diagnosing', 'Repairing', 'ReadyForDelivery']) {
    await patchJson(page, `/api/v1/work-orders/${workOrder.id}/status`, { status });
  }
  const invoice = await postJson<{ id: string }>(page, '/api/v1/invoices', {
    workOrderId: workOrder.id,
    discount: 0,
    tax: 0,
    notes: 'E2E report invoice',
  });
  await postJson(page, `/api/v1/invoices/${invoice.id}/payments`, {
    amount: 114000000,
    method: 'Cash',
  });

  await page.getByRole('link', { name: /Báo cáo/ }).click();
  await expect(page.getByRole('heading', { name: 'Báo cáo' })).toBeVisible();
  await expect(page.getByRole('row', { name: new RegExp(serviceName) })).toContainText('90.000.000 đ');
  await expect(page.getByRole('row', { name: new RegExp(`${partNumber}.*24\\.000\\.000 đ`) })).toBeVisible();
  await expect(page.getByRole('row', { name: new RegExp(`${partName}.*Tồn thấp`) })).toBeVisible();
  await expect(page.getByRole('row', { name: /Sẵn sàng giao/ })).toContainText(/\d+/);
});

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
