import { expect, test, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('admin can search maintenance history by customer and vehicle', async ({ page }) => {
  test.setTimeout(60_000);
  const suffix = Date.now();
  const customerName = `E2E History Owner ${suffix}`;
  const customerPhone = `09${String(suffix).slice(-8)}`;
  const emptyCustomerName = `E2E Empty History ${suffix}`;
  const emptyCustomerPhone = `08${String(suffix).slice(-8)}`;
  const licensePlate = `HIS-${String(suffix).slice(-5)}`;
  const serviceName = `E2E History Service ${suffix}`;
  const partNumber = `HIS-PART-${String(suffix).slice(-5)}`;
  const paymentRef = `HIS-BANK-${suffix}`;

  await loginAsAdmin(page);

  const customer = await postJson<{ id: string }>(page, '/api/v1/customers', {
    fullName: customerName,
    phone: customerPhone,
    type: 'Individual',
  });
  await postJson<{ id: string }>(page, '/api/v1/customers', {
    fullName: emptyCustomerName,
    phone: emptyCustomerPhone,
    type: 'Individual',
  });
  const vehicle = await postJson<{ id: string }>(page, '/api/v1/vehicles', {
    customerId: customer.id,
    licensePlate,
    make: 'Toyota',
    model: 'Vios',
    year: 2023,
    mileage: 24000,
  });
  const service = await postJson<{ id: string }>(page, '/api/v1/services', {
    name: serviceName,
    unitPrice: 450000,
    durationMin: 60,
  });
  const part = await postJson<{ id: string }>(page, '/api/v1/parts', {
    partNumber,
    name: `E2E History Oil Filter ${suffix}`,
    unit: 'piece',
    unitCost: 70000,
    unitPrice: 120000,
    stockQuantity: 8,
    reorderLevel: 2,
  });
  const workOrder = await postJson<{ id: string }>(page, '/api/v1/work-orders', {
    vehicleId: vehicle.id,
    diagnosis: 'Bảo dưỡng định kỳ 20.000 km',
  });
  const item = await postJson<{ id: string }>(page, `/api/v1/work-orders/${workOrder.id}/items`, {
    serviceId: service.id,
    description: serviceName,
    quantity: 1,
    unitPrice: 450000,
  });
  await postJson(page, `/api/v1/work-orders/${workOrder.id}/part-usages`, {
    workOrderItemId: item.id,
    partId: part.id,
    quantity: 1,
    unitPrice: 120000,
  });

  for (const status of ['Diagnosing', 'Repairing', 'ReadyForDelivery']) {
    await patchJson(page, `/api/v1/work-orders/${workOrder.id}/status`, { status });
  }

  const invoice = await postJson<{ id: string }>(page, '/api/v1/invoices', {
    workOrderId: workOrder.id,
    discount: 20000,
    tax: 0,
    notes: 'E2E maintenance history invoice',
  });
  await postJson(page, `/api/v1/invoices/${invoice.id}/payments`, {
    amount: 550000,
    method: 'BankTransfer',
    transactionRef: paymentRef,
  });
  await patchJson(page, `/api/v1/work-orders/${workOrder.id}/status`, { status: 'Delivered' });

  await page.getByRole('link', { name: /Lịch sử bảo dưỡng/ }).click();
  await expect(page.getByRole('heading', { name: 'Lịch sử bảo dưỡng' })).toBeVisible();

  await page.getByLabel('Khách hàng').selectOption({ label: `${emptyCustomerName} - ${emptyCustomerPhone}` });
  await expect(page.getByText('Chưa có lịch sử bảo dưỡng phù hợp')).toBeVisible();

  await page.getByLabel('Khách hàng').selectOption({ label: `${customerName} - ${customerPhone}` });
  await expect(page.getByRole('row', { name: new RegExp(licensePlate) })).toContainText(customerName);
  await expect(page.getByRole('row', { name: new RegExp(licensePlate) })).toContainText('Đã thanh toán');

  await page.getByPlaceholder('Biển số, khách hàng, SĐT').fill(licensePlate);
  await page.getByRole('button', { name: 'Tìm' }).click();
  await page.getByLabel(`Xem lịch sử ${licensePlate}`).click();

  const detailDialog = page.getByRole('dialog', { name: `Lịch sử ${licensePlate}` });
  await expect(detailDialog).toBeVisible();
  await expect(detailDialog.getByText(serviceName)).toBeVisible();
  await expect(detailDialog.getByText(partNumber)).toBeVisible();
  await expect(detailDialog.getByRole('row', { name: new RegExp(paymentRef) })).toContainText('550.000 đ');
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
