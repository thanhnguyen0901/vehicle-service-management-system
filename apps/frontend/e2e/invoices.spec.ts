import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('admin can create an immutable invoice snapshot from an eligible work order', async ({ page }) => {
  test.setTimeout(60_000);
  const suffix = Date.now();
  const customerName = `E2E Invoice Owner ${suffix}`;
  const customerPhone = `04${String(suffix).slice(-8)}`;
  const licensePlate = `INV-${String(suffix).slice(-5)}`;
  const serviceName = `E2E Invoice Service ${suffix}`;
  const partNumber = `E2E-IL-${String(suffix).slice(-6)}`;
  const partName = `E2E Invoice Part ${suffix}`;

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
  await page.getByLabel('Hãng').fill('Honda');
  await page.getByLabel('Dòng xe').fill('Civic');
  await page.getByLabel('Năm sản xuất').fill('2024');
  await page.getByRole('button', { name: 'Lưu' }).click();

  await page.getByRole('link', { name: /Dịch vụ/ }).click();
  await page.getByRole('button', { name: 'Tạo dịch vụ' }).click();
  await page.getByLabel('Tên dịch vụ').fill(serviceName);
  await page.getByLabel('Đơn giá').fill('300000');
  await page.getByLabel('Thời lượng').fill('30');
  await page.getByRole('button', { name: 'Lưu' }).click();

  await page.getByRole('link', { name: /Phụ tùng/ }).click();
  await page.getByRole('button', { name: 'Tạo phụ tùng' }).click();
  await page.getByLabel('Mã phụ tùng').fill(partNumber);
  await page.getByLabel('Tên phụ tùng').fill(partName);
  await page.getByLabel('Đơn vị tính').fill('cái');
  await page.getByLabel('Giá vốn').fill('80000');
  await page.getByLabel('Giá bán').fill('120000');
  await page.getByLabel('Tồn kho').fill('5');
  await page.getByLabel('Mức đặt lại').fill('1');
  await page.getByRole('button', { name: 'Lưu' }).click();

  await page.getByRole('link', { name: /Phiếu sửa chữa/ }).click();
  await page.getByRole('button', { name: 'Tạo phiếu' }).click();
  await page.locator('.p-dialog .p-dropdown').nth(0).click();
  await page.getByRole('option', { name: 'Walk-in' }).click();
  await page.locator('.p-dialog .p-dropdown').nth(1).click();
  await page.locator('.p-dropdown-items [role="option"]', { hasText: licensePlate }).click();
  await page.getByLabel('Chẩn đoán ban đầu').fill(`Invoice diagnosis ${suffix}`);
  await page.getByRole('button', { name: 'Lưu' }).click();

  await page.getByPlaceholder('Tìm phiếu').fill(licensePlate);
  await page.getByLabel(`Xem phiếu ${licensePlate}`).click();
  const workOrderDialog = page.getByRole('dialog', { name: `Phiếu ${licensePlate}` });

  await workOrderDialog.locator('.p-dropdown').nth(1).click();
  await page.locator('.p-dropdown-items [role="option"]', { hasText: serviceName }).click();
  await workOrderDialog.getByRole('button', { name: 'Thêm' }).click();

  await workOrderDialog.locator('.p-dropdown').nth(3).click();
  await page.locator('.p-dropdown-items [role="option"]', { hasText: partNumber }).click();
  await workOrderDialog.getByLabel('SL phụ tùng').fill('2');
  await workOrderDialog.getByRole('button', { name: 'Ghi nhận' }).click();

  for (const status of ['Chẩn đoán', 'Đang sửa', 'Sẵn sàng giao']) {
    await workOrderDialog.locator('.p-dropdown').nth(0).click();
    await page.getByRole('option', { name: status, exact: true }).click();
    await expect(page.getByText('Đã cập nhật trạng thái phiếu')).toBeVisible();
  }
  await workOrderDialog.getByRole('button', { name: 'Close' }).click();

  await page.getByRole('link', { name: 'Hóa đơn' }).click();
  await expect(page.getByRole('heading', { name: 'Hóa đơn' })).toBeVisible();
  await page.getByRole('button', { name: 'Lập hóa đơn' }).click();
  const createDialog = page.getByRole('dialog', { name: 'Lập hóa đơn' });
  await createDialog.getByLabel('Phiếu sửa chữa').selectOption({ label: `${licensePlate} - ${customerName}` });
  await createDialog.getByLabel('Giảm giá').fill('40000');
  await createDialog.getByLabel('Thuế').fill('10000');
  await createDialog.getByLabel('Ghi chú hóa đơn').fill(`Invoice snapshot ${suffix}`);

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
  await expect(detailDialog.getByRole('cell', { name: serviceName, exact: true })).toBeVisible();
  await expect(detailDialog.getByRole('cell', { name: `${partNumber} - ${partName}`, exact: true })).toBeVisible();
  await expect(detailDialog.getByText(/510\.000/)).toBeVisible();
  await expect(detailDialog.getByText(`Invoice snapshot ${suffix}`)).toBeVisible();

  const duplicateResponse = await page.request.post('/api/v1/invoices', {
    data: {
      workOrderId: invoice.workOrderId,
      discount: 0,
      tax: 0,
    },
  });
  expect(duplicateResponse.status()).toBe(409);

  await detailDialog.getByRole('button', { name: 'Close' }).click();
  await page.getByPlaceholder('Tìm hóa đơn').fill(licensePlate);
  const invoiceRow = page.getByRole('row', { name: new RegExp(licensePlate) });
  await expect(invoiceRow).toContainText('510.000');
  await expect(invoiceRow).toContainText('Chưa thanh toán');
});
