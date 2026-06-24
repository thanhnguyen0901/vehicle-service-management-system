import { expect, test, type Locator } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('admin can import, export, adjust and filter inventory transactions', async ({ page }) => {
  const suffix = Date.now();
  const partNumber = `E2E-INV-${String(suffix).slice(-6)}`;
  const partName = `E2E Inventory Part ${suffix}`;

  await loginAsAdmin(page);
  await page.getByRole('link', { name: /Phụ tùng/ }).click();
  await page.getByRole('button', { name: 'Tạo phụ tùng' }).click();
  await page.getByLabel('Mã phụ tùng').fill(partNumber);
  await page.getByLabel('Tên phụ tùng').fill(partName);
  await page.getByLabel('Đơn vị tính').fill('cái');
  await page.getByLabel('Giá vốn').fill('100000');
  await page.getByLabel('Giá bán').fill('150000');
  await page.getByLabel('Tồn kho').fill('3');
  await page.getByLabel('Mức đặt lại').fill('2');
  await page.getByRole('button', { name: 'Lưu' }).click();

  await page.getByRole('link', { name: 'Giao dịch kho' }).click();
  await expect(page.getByRole('heading', { name: 'Giao dịch kho' })).toBeVisible();

  await page.getByRole('button', { name: 'Nhập kho' }).click();
  let dialog = page.getByRole('dialog', { name: 'Nhập kho' });
  await selectPart(dialog.getByLabel('Phụ tùng'), partNumber);
  await dialog.getByLabel('Số lượng').fill('7');
  await dialog.getByLabel('Ghi chú').fill(`Nhập E2E ${suffix}`);
  await dialog.getByRole('button', { name: 'Xác nhận' }).click();
  await expect(page.getByRole('row', { name: new RegExp(`Nhập E2E ${suffix}`) })).toContainText('+7');
  await expect(page.getByRole('row', { name: new RegExp(`Nhập E2E ${suffix}`) })).toContainText('10');

  await page.getByRole('button', { name: 'Xuất kho' }).click();
  dialog = page.getByRole('dialog', { name: 'Xuất kho' });
  await selectPart(dialog.getByLabel('Phụ tùng'), partNumber);
  await dialog.getByLabel('Số lượng').fill('4');
  await dialog.getByLabel('Ghi chú').fill(`Xuất E2E ${suffix}`);
  await dialog.getByRole('button', { name: 'Xác nhận' }).click();
  await expect(page.getByRole('row', { name: new RegExp(`Xuất E2E ${suffix}`) })).toContainText('-4');
  await expect(page.getByRole('row', { name: new RegExp(`Xuất E2E ${suffix}`) })).toContainText('6');

  await page.getByRole('button', { name: 'Điều chỉnh' }).click();
  dialog = page.getByRole('dialog', { name: 'Điều chỉnh tồn' });
  await selectPart(dialog.getByLabel('Phụ tùng'), partNumber);
  await dialog.getByLabel('Chênh lệch tồn kho').fill('-2');
  await dialog.getByLabel('Ghi chú').fill(`Điều chỉnh E2E ${suffix}`);
  await dialog.getByRole('button', { name: 'Xác nhận' }).click();
  await expect(page.getByRole('row', { name: new RegExp(`Điều chỉnh E2E ${suffix}`) })).toContainText('-2');
  await expect(page.getByRole('row', { name: new RegExp(`Điều chỉnh E2E ${suffix}`) })).toContainText('4');

  await selectPart(page.getByLabel('Lọc theo phụ tùng'), partNumber);
  await page.getByLabel('Lọc theo loại').selectOption('Adjustment');
  await expect(page.getByRole('row', { name: new RegExp(`Điều chỉnh E2E ${suffix}`) })).toBeVisible();
  await expect(page.getByText(`Nhập E2E ${suffix}`)).toHaveCount(0);
  await expect(page.getByText(`Xuất E2E ${suffix}`)).toHaveCount(0);

  await page.getByRole('button', { name: 'Xuất kho' }).click();
  dialog = page.getByRole('dialog', { name: 'Xuất kho' });
  await selectPart(dialog.getByLabel('Phụ tùng'), partNumber);
  await dialog.getByLabel('Số lượng').fill('99');
  await dialog.getByRole('button', { name: 'Xác nhận' }).click();
  await expect(page.getByText(/Insufficient stock/)).toBeVisible();
  await dialog.getByRole('button', { name: 'Hủy' }).click();
});

async function selectPart(select: Locator, partNumber: string) {
  const value = await select.locator('option').filter({ hasText: partNumber }).getAttribute('value');
  if (!value) throw new Error(`Part option ${partNumber} was not found`);
  await select.selectOption(value);
}
