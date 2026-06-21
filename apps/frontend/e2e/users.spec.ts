import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('admin can create, search, update and deactivate a user', async ({ page }) => {
  const suffix = Date.now();
  const username = `e2e_user_${suffix}`;
  const email = `${username}@garage.local`;
  const updatedName = `E2E User Updated ${suffix}`;

  await loginAsAdmin(page);
  await page.getByRole('link', { name: /Người dùng/ }).click();

  await expect(page.getByRole('heading', { name: 'Người dùng' })).toBeVisible();

  await page.getByRole('button', { name: 'Tạo người dùng' }).click();
  await page.getByLabel('Tên đăng nhập').fill(username);
  await page.getByLabel('Mật khẩu').fill('User@1234');
  await page.getByLabel('Họ tên').fill(`E2E User ${suffix}`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('SĐT').fill('0900000000');
  await page.getByRole('button', { name: 'Lưu' }).click();

  await expect(page.getByRole('cell', { name: username, exact: true })).toBeVisible();

  await page.getByPlaceholder('Tìm người dùng').fill(username);
  await expect(page.getByText(email)).toBeVisible();

  await page.getByLabel(`Sửa ${username}`).click();
  await page.getByLabel('Họ tên').fill(updatedName);
  await page.getByRole('button', { name: 'Lưu' }).click();

  await expect(page.getByText(updatedName)).toBeVisible();

  await page.getByLabel(`Khóa ${username}`).click();
  await expect(page.getByText('Đã khóa')).toBeVisible();
});
