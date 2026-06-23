import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('admin can create, search, update and deactivate a service', async ({ page }) => {
  const suffix = Date.now();
  const serviceName = `E2E Service ${suffix}`;
  const updatedName = `E2E Service Updated ${suffix}`;

  await loginAsAdmin(page);
  await page.getByRole('link', { name: /Dịch vụ/ }).click();

  await expect(page.getByRole('heading', { name: 'Dịch vụ' })).toBeVisible();

  await page.getByRole('button', { name: 'Tạo dịch vụ' }).click();
  await page.getByLabel('Tên dịch vụ').fill(serviceName);
  await page.getByLabel('Đơn giá').fill('250000');
  await page.getByLabel('Thời lượng phút').fill('45');
  await page.getByLabel('Mô tả').fill('Dịch vụ tạo từ E2E');
  await page.getByRole('button', { name: 'Lưu' }).click();

  await expect(page.getByRole('cell', { name: serviceName, exact: true })).toBeVisible();

  await page.getByPlaceholder('Tìm dịch vụ').fill(serviceName);
  await expect(page.getByText('250.000')).toBeVisible();

  await page.getByLabel(`Sửa ${serviceName}`).click();
  await page.getByLabel('Tên dịch vụ').fill(updatedName);
  await page.getByLabel('Đơn giá').fill('300000');
  await page.getByRole('button', { name: 'Lưu' }).click();

  await page.getByPlaceholder('Tìm dịch vụ').fill(updatedName);
  await expect(page.getByRole('cell', { name: updatedName, exact: true })).toBeVisible();
  await expect(page.getByText('300.000')).toBeVisible();

  await page.getByLabel(`Ngưng dùng ${updatedName}`).click();
  await expect(page.getByText('Ngưng dùng')).toBeVisible();
});
