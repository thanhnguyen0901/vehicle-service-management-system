import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('admin can create, search, update and delete a corporate customer', async ({ page }) => {
  const suffix = Date.now();
  const fullName = `E2E Customer ${suffix}`;
  const phone = `09${String(suffix).slice(-8)}`;
  const email = `customer_${suffix}@garage.local`;
  const companyName = `E2E Company ${suffix}`;
  const updatedName = `E2E Customer Updated ${suffix}`;

  await loginAsAdmin(page);
  await page.getByRole('link', { name: /Khách hàng/ }).click();

  await expect(page.getByRole('heading', { name: 'Khách hàng' })).toBeVisible();

  await page.getByRole('button', { name: 'Tạo khách hàng' }).click();
  await page.getByLabel('Họ tên').fill(fullName);
  await page.getByLabel('SĐT').fill(phone);
  await page.getByLabel('Email').fill(email);
  await page.locator('.p-dialog .p-dropdown').click();
  await page.getByRole('option', { name: 'Doanh nghiệp' }).click();
  await page.getByLabel('Tên công ty').fill(companyName);
  await page.getByLabel('Mã số thuế').fill(`MST${String(suffix).slice(-6)}`);
  await page.getByRole('button', { name: 'Lưu' }).click();

  await expect(page.getByRole('cell', { name: fullName, exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: companyName, exact: true })).toBeVisible();

  await page.getByPlaceholder('Tìm khách hàng').fill(phone);
  await expect(page.getByRole('cell', { name: email, exact: true })).toBeVisible();

  await page.getByLabel(`Sửa ${fullName}`).click();
  await page.getByLabel('Họ tên').fill(updatedName);
  await page.getByRole('button', { name: 'Lưu' }).click();

  await expect(page.getByRole('cell', { name: updatedName, exact: true })).toBeVisible();

  await page.getByLabel(`Xóa ${updatedName}`).click();
  await expect(page.getByRole('cell', { name: updatedName, exact: true })).toHaveCount(0);
});
