import { expect, type Page } from '@playwright/test';

export const adminCredentials = {
  username: process.env.E2E_ADMIN_USERNAME ?? 'admin',
  password: process.env.E2E_ADMIN_PASSWORD ?? 'Admin@123',
};

export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Tên đăng nhập').fill(adminCredentials.username);
  await page.getByLabel('Mật khẩu').fill(adminCredentials.password);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page.getByRole('heading', { name: 'Tổng quan' })).toBeVisible();
}
