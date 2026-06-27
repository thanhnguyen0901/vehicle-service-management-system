import { expect, test, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('admin can create and mark a maintenance reminder as sent', async ({ page }) => {
  test.setTimeout(60_000);
  const suffix = Date.now();
  const customerName = `E2E Reminder Owner ${suffix}`;
  const customerPhone = `07${String(suffix).slice(-8)}`;
  const otherCustomerName = `E2E Reminder Other ${suffix}`;
  const otherCustomerPhone = `06${String(suffix).slice(-8)}`;
  const licensePlate = `REM-${String(suffix).slice(-5)}`;
  const message = `Nhắc bảo dưỡng định kỳ ${suffix}`;

  await loginAsAdmin(page);

  const customer = await postJson<{ id: string }>(page, '/api/v1/customers', {
    fullName: customerName,
    phone: customerPhone,
    type: 'Individual',
  });
  const otherCustomer = await postJson<{ id: string }>(page, '/api/v1/customers', {
    fullName: otherCustomerName,
    phone: otherCustomerPhone,
    type: 'Individual',
  });
  const vehicle = await postJson<{ id: string }>(page, '/api/v1/vehicles', {
    customerId: customer.id,
    licensePlate,
    make: 'Honda',
    model: 'City',
    year: 2022,
    mileage: 31000,
  });

  const mismatchResponse = await page.request.post('/api/v1/reminders', {
    data: {
      customerId: otherCustomer.id,
      vehicleId: vehicle.id,
      dueDate: today(),
      message: 'Invalid owner reminder',
    },
  });
  expect(mismatchResponse.status()).toBe(400);

  await page.getByRole('link', { name: /Nhắc bảo dưỡng/ }).click();
  await expect(page.getByRole('heading', { name: 'Nhắc bảo dưỡng' })).toBeVisible();

  await page.getByRole('button', { name: 'Tạo nhắc' }).click();
  const dialog = page.getByRole('dialog', { name: 'Tạo nhắc bảo dưỡng' });
  await dialog.getByLabel('Khách hàng').selectOption({ label: `${customerName} - ${customerPhone}` });
  await dialog.getByLabel('Phương tiện').selectOption({ label: `${licensePlate} - Honda City` });
  await dialog.getByLabel('Hạn nhắc').fill(today());
  await dialog.getByLabel('Nội dung').fill(message);
  await dialog.getByRole('button', { name: 'Lưu' }).click();

  await expect(page.getByText('Đã tạo nhắc bảo dưỡng')).toBeVisible();
  const pendingRow = page.getByRole('row', { name: new RegExp(licensePlate) });
  await expect(pendingRow).toContainText(message);
  await expect(pendingRow).toContainText('Đến hạn');

  await page.getByPlaceholder('Biển số, khách hàng, nội dung').fill(message);
  await page.getByRole('button', { name: 'Tìm' }).click();
  await expect(page.getByRole('row', { name: new RegExp(message) })).toContainText(licensePlate);

  await page.getByLabel(`Đánh dấu đã nhắc ${licensePlate}`).click();
  await expect(page.getByText('Đã đánh dấu đã nhắc')).toBeVisible();
  await expect(page.getByText('Chưa có nhắc bảo dưỡng phù hợp')).toBeVisible();

  await page.getByLabel('Trạng thái').selectOption('sent');
  await expect(page.getByRole('row', { name: new RegExp(licensePlate) })).toContainText('Đã nhắc');
});

async function postJson<T = unknown>(page: Page, url: string, data: unknown): Promise<T> {
  const response = await page.request.post(url, { data });
  expect(response.ok()).toBeTruthy();
  return response.json() as Promise<T>;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
