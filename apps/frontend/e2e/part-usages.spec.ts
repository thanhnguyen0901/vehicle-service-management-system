import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('admin can record, update and remove part usage with transactional stock changes', async ({ page }) => {
  test.setTimeout(60_000);
  const suffix = Date.now();
  const customerName = `E2E Part Usage Owner ${suffix}`;
  const customerPhone = `05${String(suffix).slice(-8)}`;
  const licensePlate = `PU-${String(suffix).slice(-5)}`;
  const serviceName = `E2E Part Usage Service ${suffix}`;
  const partNumber = `E2E-PU-${String(suffix).slice(-6)}`;
  const partName = `E2E Part Usage ${suffix}`;

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
  await page.getByLabel('Hãng').fill('Toyota');
  await page.getByLabel('Dòng xe').fill('Corolla Cross');
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
  await page.getByLabel('Chẩn đoán ban đầu').fill(`Part usage diagnosis ${suffix}`);
  await page.getByRole('button', { name: 'Lưu' }).click();

  await page.getByPlaceholder('Tìm phiếu').fill(licensePlate);
  await page.getByLabel(`Xem phiếu ${licensePlate}`).click();
  const dialog = page.getByRole('dialog', { name: `Phiếu ${licensePlate}` });

  await dialog.locator('.p-dropdown').nth(1).click();
  await page.locator('.p-dropdown-items [role="option"]', { hasText: serviceName }).click();
  await dialog.getByRole('button', { name: 'Thêm' }).click();
  await expect(dialog.getByRole('cell', { name: serviceName, exact: true })).toBeVisible();

  await dialog.locator('.p-dropdown').nth(3).click();
  await page.locator('.p-dropdown-items [role="option"]', { hasText: partNumber }).click();
  await dialog.getByLabel('SL phụ tùng').fill('2');
  await dialog.getByRole('button', { name: 'Ghi nhận' }).click();
  await expect(dialog.getByRole('row', { name: new RegExp(partNumber) })).toContainText('2');

  await dialog.getByLabel(`Sửa phụ tùng ${partNumber}`).click();
  await dialog.getByLabel('SL phụ tùng').fill('99');
  await dialog.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByText(/Insufficient stock/)).toBeVisible();

  await dialog.getByLabel('SL phụ tùng').fill('3');
  await dialog.getByRole('button', { name: 'Lưu' }).click();
  await expect(dialog.getByRole('row', { name: new RegExp(partNumber) })).toContainText('3');

  await dialog.getByLabel(`Xóa phụ tùng ${partNumber}`).click();
  await expect(dialog.getByText('Chưa ghi nhận phụ tùng')).toBeVisible();
  await dialog.getByRole('button', { name: 'Close' }).click();

  await page.getByRole('link', { name: /Phụ tùng/ }).click();
  await page.getByPlaceholder('Tìm phụ tùng').fill(partNumber);
  const partRow = page.getByRole('row', { name: new RegExp(partNumber) });
  await expect(partRow.getByRole('cell').nth(5)).toHaveText('5');
});
