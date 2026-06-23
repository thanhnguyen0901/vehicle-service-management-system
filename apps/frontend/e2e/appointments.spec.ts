import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('admin can create, search, update and delete an appointment', async ({ page }) => {
  const suffix = Date.now();
  const customerName = `E2E Appointment Owner ${suffix}`;
  const customerPhone = `07${String(suffix).slice(-8)}`;
  const licensePlate = `APT-${String(suffix).slice(-5)}`;
  const serviceNote = `Appointment check ${suffix}`;

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
  await page.getByLabel('Hãng').fill('Honda');
  await page.getByLabel('Dòng xe').fill('City');
  await page.getByLabel('Năm sản xuất').fill('2021');
  await page.getByRole('button', { name: 'Lưu' }).click();
  await expect(page.getByRole('cell', { name: licensePlate, exact: true })).toBeVisible();

  await page.getByRole('link', { name: /Lịch hẹn/ }).click();
  await expect(page.getByRole('heading', { name: 'Lịch hẹn' })).toBeVisible();

  await page.getByRole('button', { name: 'Tạo lịch hẹn' }).click();
  await page.locator('.p-dialog .p-dropdown').click();
  await page.locator('.p-dropdown-items [role="option"]', { hasText: licensePlate }).click();
  await page.getByLabel('Thời gian hẹn').fill('2026-07-15T09:30');
  await page.getByLabel('Nhu cầu dịch vụ').fill(serviceNote);
  await page.getByRole('button', { name: 'Lưu' }).click();

  await expect(page.getByRole('cell', { name: licensePlate, exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: customerName, exact: true })).toBeVisible();
  await expect(page.getByText(serviceNote)).toBeVisible();

  await page.getByPlaceholder('Tìm lịch hẹn').fill(licensePlate);
  await expect(page.getByRole('cell', { name: 'Đã đặt', exact: true })).toBeVisible();

  await page.getByLabel(`Sửa lịch ${licensePlate}`).click();
  await page.locator('.p-dialog .p-dropdown').nth(1).click();
  await page.getByRole('option', { name: 'Đã đến' }).click();
  await page.getByRole('button', { name: 'Lưu' }).click();

  await expect(page.getByRole('cell', { name: 'Đã đến', exact: true })).toBeVisible();

  await page.getByLabel(`Xóa lịch ${licensePlate}`).click();
  await expect(page.getByText('Chưa có lịch hẹn phù hợp')).toBeVisible();
});
