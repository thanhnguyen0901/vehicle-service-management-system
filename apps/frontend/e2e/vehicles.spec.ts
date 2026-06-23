import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('admin can create, search, update and delete a vehicle', async ({ page }) => {
  const suffix = Date.now();
  const customerName = `E2E Vehicle Owner ${suffix}`;
  const customerPhone = `08${String(suffix).slice(-8)}`;
  const licensePlate = `E2E-${String(suffix).slice(-5)}`;
  const updatedColor = `Đỏ ${String(suffix).slice(-3)}`;

  await loginAsAdmin(page);

  await page.getByRole('link', { name: /Khách hàng/ }).click();
  await page.getByRole('button', { name: 'Tạo khách hàng' }).click();
  await page.getByLabel('Họ tên').fill(customerName);
  await page.getByLabel('SĐT').fill(customerPhone);
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByRole('cell', { name: customerName, exact: true })).toBeVisible();

  await page.getByRole('link', { name: /Phương tiện/ }).click();
  await expect(page.getByRole('heading', { name: 'Phương tiện' })).toBeVisible();

  await page.getByRole('button', { name: 'Tạo xe' }).click();
  await page.locator('.p-dialog .p-dropdown').click();
  await page.locator('.p-dropdown-items [role="option"]', { hasText: customerName }).click();
  await page.getByLabel('Biển số').fill(licensePlate);
  await page.getByLabel('Hãng').fill('Toyota');
  await page.getByLabel('Dòng xe').fill('Vios');
  await page.getByLabel('Năm sản xuất').fill('2022');
  await page.getByLabel('Màu').fill('Trắng');
  await page.getByLabel('VIN').fill(`VIN${String(suffix).slice(-10)}`);
  await page.getByLabel('Odo').fill('12000');
  await page.getByRole('button', { name: 'Lưu' }).click();

  await expect(page.getByRole('cell', { name: licensePlate, exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: customerName, exact: true })).toBeVisible();

  await page.getByPlaceholder('Tìm xe').fill(licensePlate);
  await expect(page.getByRole('cell', { name: 'Toyota', exact: true })).toBeVisible();

  await page.getByLabel(`Sửa ${licensePlate}`).click();
  await page.getByLabel('Màu').fill(updatedColor);
  await page.getByRole('button', { name: 'Lưu' }).click();

  await expect(page.getByRole('cell', { name: updatedColor, exact: true })).toBeVisible();

  await page.getByLabel(`Xóa ${licensePlate}`).click();
  await expect(page.getByText('Chưa có xe phù hợp')).toBeVisible();
});
