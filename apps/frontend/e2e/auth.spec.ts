import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('admin can login and logout through the UI', async ({ page }) => {
  await loginAsAdmin(page);

  await page.getByRole('button', { name: 'Đăng xuất' }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Đăng nhập' })).toBeVisible();
});
