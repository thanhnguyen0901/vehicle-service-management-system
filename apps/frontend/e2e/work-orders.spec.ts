import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('admin can create a work order from appointment and manage service items', async ({ page }) => {
  const suffix = Date.now();
  const customerName = `E2E Work Owner ${suffix}`;
  const customerPhone = `06${String(suffix).slice(-8)}`;
  const licensePlate = `WO-${String(suffix).slice(-5)}`;
  const serviceName = `E2E Work Service ${suffix}`;
  const diagnosis = `Initial diagnosis ${suffix}`;
  const updatedItem = `Updated work item ${suffix}`;

  await loginAsAdmin(page);

  await page.getByRole('link', { name: /Khách hàng/ }).click();
  await page.getByRole('button', { name: 'Tạo khách hàng' }).click();
  await page.getByLabel('Họ tên').fill(customerName);
  await page.getByLabel('SĐT').fill(customerPhone);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByRole('cell', { name: customerName, exact: true })).toBeVisible();

  await page.getByRole('link', { name: /Phương tiện/ }).click();
  await page.getByRole('button', { name: 'Tạo xe' }).click();
  await page.locator('.p-dialog .p-dropdown').click();
  await page.locator('.p-dropdown-items [role="option"]', { hasText: customerName }).click();
  await page.getByLabel('Biển số').fill(licensePlate);
  await page.getByLabel('Hãng').fill('Mazda');
  await page.getByLabel('Dòng xe').fill('CX-5');
  await page.getByLabel('Năm sản xuất').fill('2023');
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByRole('cell', { name: licensePlate, exact: true })).toBeVisible();

  await page.getByRole('link', { name: /Lịch hẹn/ }).click();
  await page.getByRole('button', { name: 'Tạo lịch hẹn' }).click();
  await page.locator('.p-dialog .p-dropdown').click();
  await page.locator('.p-dropdown-items [role="option"]', { hasText: licensePlate }).click();
  await page.getByLabel('Thời gian hẹn').fill('2026-08-10T10:00');
  await page.getByLabel('Nhu cầu dịch vụ').fill(`Work order appointment ${suffix}`);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await page.getByPlaceholder('Tìm lịch hẹn').fill(licensePlate);
  await expect(page.getByRole('cell', { name: licensePlate, exact: true })).toBeVisible();

  await page.getByRole('link', { name: /Dịch vụ/ }).click();
  await page.getByRole('button', { name: 'Tạo dịch vụ' }).click();
  await page.getByLabel('Tên dịch vụ').fill(serviceName);
  await page.getByLabel('Đơn giá').fill('250000');
  await page.getByLabel('Thời lượng').fill('45');
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByRole('cell', { name: serviceName, exact: true })).toBeVisible();

  await page.getByRole('link', { name: /Phiếu sửa chữa/ }).click();
  await expect(page.getByRole('heading', { name: 'Phiếu sửa chữa' })).toBeVisible();

  await page.getByRole('button', { name: 'Tạo phiếu' }).click();
  await page.locator('.p-dialog .p-dropdown').nth(1).click();
  await page.locator('.p-dropdown-items [role="option"]', { hasText: licensePlate }).click();
  await page.getByLabel('Chẩn đoán ban đầu').fill(diagnosis);
  await page.getByRole('button', { name: 'Lưu' }).click();

  await expect(page.getByRole('cell', { name: licensePlate, exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: customerName, exact: true })).toBeVisible();
  await expect(page.getByRole('row', { name: new RegExp(licensePlate) })).toContainText('Tiếp nhận');

  await page.getByPlaceholder('Tìm phiếu').fill(licensePlate);
  await expect(page.getByText(diagnosis)).toBeVisible();

  await page.getByLabel(`Xem phiếu ${licensePlate}`).click();
  await page.locator('.p-dialog .p-dropdown').nth(0).click();
  await page.getByRole('option', { name: 'Chẩn đoán' }).click();
  await expect(page.getByText('Đã cập nhật trạng thái phiếu')).toBeVisible();

  await page.locator('.p-dialog .p-dropdown').nth(1).click();
  await page.locator('.p-dropdown-items [role="option"]', { hasText: serviceName }).click();
  await page.getByLabel('SL', { exact: true }).fill('2');
  await page.getByRole('button', { name: 'Thêm' }).click();
  await expect(page.getByRole('cell', { name: serviceName, exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: /500\.000/ })).toBeVisible();

  await page.getByLabel(`Sửa hạng mục ${serviceName}`).click();
  await page.locator('.p-dialog form').first().getByLabel('Hạng mục').fill(updatedItem);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByRole('cell', { name: updatedItem, exact: true })).toBeVisible();

  await page.getByLabel(`Xóa hạng mục ${updatedItem}`).click();
  await expect(page.getByText('Chưa có hạng mục')).toBeVisible();
});
