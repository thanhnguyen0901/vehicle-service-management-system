import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('admin can record partial and final payments without overpaying an invoice', async ({ page }) => {
  test.setTimeout(60_000);
  const suffix = Date.now();
  const customerName = `E2E Payment Owner ${suffix}`;
  const customerPhone = `03${String(suffix).slice(-8)}`;
  const licensePlate = `PAY-${String(suffix).slice(-5)}`;
  const serviceName = `E2E Payment Service ${suffix}`;

  await loginAsAdmin(page);

  await page.getByRole('link', { name: /Khách hàng/ }).click();
  await page.getByRole('button', { name: 'Tạo khách hàng' }).click();
  await page.getByLabel('Họ tên').fill(customerName);
  await page.getByLabel('SĐT').fill(customerPhone);
  await page.getByRole('button', { name: 'Lưu' }).click();

  await page.getByRole('link', { name: /Phương tiện/ }).click();
  await page.getByRole('button', { name: 'Tạo xe' }).click();
  await page.locator('.p-dialog .p-dropdown').click();
  await page.locator('.p-dropdown-items [role="option"]', { hasText: customerName }).click();
  await page.getByLabel('Biển số').fill(licensePlate);
  await page.getByLabel('Hãng').fill('Ford');
  await page.getByLabel('Dòng xe').fill('Territory');
  await page.getByLabel('Năm sản xuất').fill('2024');
  await page.getByRole('button', { name: 'Lưu' }).click();

  await page.getByRole('link', { name: /Dịch vụ/ }).click();
  await page.getByRole('button', { name: 'Tạo dịch vụ' }).click();
  await page.getByLabel('Tên dịch vụ').fill(serviceName);
  await page.getByLabel('Đơn giá').fill('500000');
  await page.getByLabel('Thời lượng').fill('45');
  await page.getByRole('button', { name: 'Lưu' }).click();

  await page.getByRole('link', { name: /Phiếu sửa chữa/ }).click();
  await page.getByRole('button', { name: 'Tạo phiếu' }).click();
  await page.locator('.p-dialog .p-dropdown').nth(0).click();
  await page.getByRole('option', { name: 'Walk-in' }).click();
  await page.locator('.p-dialog .p-dropdown').nth(1).click();
  await page.locator('.p-dropdown-items [role="option"]', { hasText: licensePlate }).click();
  await page.getByRole('button', { name: 'Lưu' }).click();

  await page.getByPlaceholder('Tìm phiếu').fill(licensePlate);
  await page.getByLabel(`Xem phiếu ${licensePlate}`).click();
  const workOrderDialog = page.getByRole('dialog', { name: `Phiếu ${licensePlate}` });
  await workOrderDialog.locator('.p-dropdown').nth(1).click();
  await page.locator('.p-dropdown-items [role="option"]', { hasText: serviceName }).click();
  await workOrderDialog.getByRole('button', { name: 'Thêm' }).click();

  for (const status of ['Chẩn đoán', 'Đang sửa', 'Sẵn sàng giao']) {
    await workOrderDialog.locator('.p-dropdown').nth(0).click();
    await page.getByRole('option', { name: status, exact: true }).click();
  }
  await workOrderDialog.getByRole('button', { name: 'Close' }).click();

  await page.getByRole('link', { name: 'Hóa đơn' }).click();
  await page.getByRole('button', { name: 'Lập hóa đơn' }).click();
  const createDialog = page.getByRole('dialog', { name: 'Lập hóa đơn' });
  await createDialog.getByLabel('Phiếu sửa chữa').selectOption({
    label: `${licensePlate} - ${customerName}`,
  });

  const invoiceResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/invoices') &&
      response.request().method() === 'POST' &&
      response.status() === 201,
  );
  await createDialog.getByRole('button', { name: 'Xác nhận lập' }).click();
  const invoiceResponse = await invoiceResponsePromise;
  const invoice = (await invoiceResponse.json()) as { id: string; workOrderId: string };

  const detailDialog = page.getByRole('dialog', { name: /Hóa đơn INV-/ });
  const prematureDeliveryResponse = await page.request.patch(
    `/api/v1/work-orders/${invoice.workOrderId}/status`,
    { data: { status: 'Delivered' } },
  );
  expect(prematureDeliveryResponse.status()).toBe(409);

  await detailDialog.getByLabel('Số tiền').fill('200000');
  await detailDialog.getByLabel('Phương thức').selectOption('Cash');
  await detailDialog.getByRole('button', { name: 'Ghi nhận' }).click();
  await expect(page.getByText('Đã ghi nhận thanh toán')).toBeVisible();
  await expect(detailDialog.getByText(/200\.000/).last()).toBeVisible();
  await expect(detailDialog.getByText(/300\.000/).last()).toBeVisible();
  await expect(detailDialog.getByRole('row', { name: /Tiền mặt/ })).toContainText('200.000');

  const overpaymentResponse = await page.request.post(`/api/v1/invoices/${invoice.id}/payments`, {
    data: {
      amount: 300001,
      method: 'Cash',
    },
  });
  expect(overpaymentResponse.status()).toBe(400);

  await detailDialog.getByLabel('Số tiền').fill('300000');
  await detailDialog.getByLabel('Phương thức').selectOption('BankTransfer');
  await detailDialog.getByLabel('Mã giao dịch').fill(`BANK-${suffix}`);
  await detailDialog.getByRole('button', { name: 'Ghi nhận' }).click();
  await expect(page.getByText('Hóa đơn đã thanh toán đủ')).toBeVisible();
  await expect(detailDialog.locator('.p-tag').getByText('Đã thanh toán', { exact: true })).toBeVisible();
  await expect(detailDialog.getByRole('row', { name: new RegExp(`BANK-${suffix}`) })).toContainText(
    '300.000',
  );

  const paidResponse = await page.request.post(`/api/v1/invoices/${invoice.id}/payments`, {
    data: {
      amount: 1,
      method: 'Cash',
    },
  });
  expect(paidResponse.status()).toBe(409);

  await detailDialog.getByRole('button', { name: 'Close' }).click();
  await page.getByPlaceholder('Tìm hóa đơn').fill(licensePlate);
  await expect(page.getByRole('row', { name: new RegExp(licensePlate) })).toContainText('Đã thanh toán');

  await page.getByRole('link', { name: /Phiếu sửa chữa/ }).click();
  await page.getByPlaceholder('Tìm phiếu').fill(licensePlate);
  await page.getByLabel(`Xem phiếu ${licensePlate}`).click();
  const deliveryDialog = page.getByRole('dialog', { name: `Phiếu ${licensePlate}` });
  await deliveryDialog.locator('.p-dropdown').nth(0).click();
  await page.getByRole('option', { name: 'Đã giao', exact: true }).click();
  await expect(page.getByText('Đã cập nhật trạng thái phiếu')).toBeVisible();
});
