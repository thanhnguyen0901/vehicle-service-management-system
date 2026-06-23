import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('admin can create, filter, update and deactivate a low-stock part', async ({ page }) => {
  const suffix = Date.now();
  const partNumber = `E2E-PART-${String(suffix).slice(-6)}`;
  const partName = `E2E Part ${suffix}`;
  const updatedName = `E2E Part Updated ${suffix}`;

  await loginAsAdmin(page);
  await page.getByRole('link', { name: /Phụ tùng/ }).click();

  await expect(page.getByRole('heading', { name: 'Phụ tùng' })).toBeVisible();

  await page.getByRole('button', { name: 'Tạo phụ tùng' }).click();
  await page.getByLabel('Mã phụ tùng').fill(partNumber);
  await page.getByLabel('Tên phụ tùng').fill(partName);
  await page.getByLabel('Đơn vị tính').fill('cái');
  await page.getByLabel('Giá vốn').fill('120000');
  await page.getByLabel('Giá bán').fill('180000');
  await page.getByLabel('Tồn kho').fill('2');
  await page.getByLabel('Mức đặt lại').fill('5');
  await page.getByLabel('Mô tả').fill('Phụ tùng tạo từ E2E');
  await page.getByRole('button', { name: 'Lưu' }).click();

  await expect(page.getByRole('cell', { name: partNumber, exact: true })).toBeVisible();
  await expect(page.getByRole('row', { name: new RegExp(partNumber) }).getByText('Cần nhập')).toBeVisible();

  await page.getByRole('checkbox', { name: 'Lọc tồn thấp' }).click();
  await page.getByPlaceholder('Tìm phụ tùng').fill(partNumber);
  await expect(page.getByRole('cell', { name: partName, exact: true })).toBeVisible();

  await page.getByLabel(`Sửa ${partNumber}`).click();
  await page.getByLabel('Tên phụ tùng').fill(updatedName);
  await page.getByLabel('Tồn kho').fill('8');
  await page.getByRole('button', { name: 'Lưu' }).click();

  await page.getByRole('checkbox', { name: 'Lọc tồn thấp' }).click();
  await page.getByPlaceholder('Tìm phụ tùng').fill(partNumber);
  await expect(page.getByRole('cell', { name: updatedName, exact: true })).toBeVisible();
  await expect(page.getByRole('row', { name: new RegExp(partNumber) }).getByText('Đủ')).toBeVisible();

  await page.getByLabel(`Ngưng dùng ${partNumber}`).click();
  await expect(page.getByRole('row', { name: new RegExp(partNumber) }).getByText('Ngưng dùng')).toBeVisible();
});
