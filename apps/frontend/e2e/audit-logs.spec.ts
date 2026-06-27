import { expect, test, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('admin can view and filter audit logs for business changes', async ({ page }) => {
  test.setTimeout(60_000);
  const suffix = Date.now();
  const customerName = `E2E Audit Customer ${suffix}`;
  const customerPhone = `04${String(suffix).slice(-8)}`;

  await loginAsAdmin(page);

  await postJson(page, '/api/v1/customers', {
    fullName: customerName,
    phone: customerPhone,
    type: 'Individual',
  });

  await page.getByRole('link', { name: /Nhật ký/ }).click();
  await expect(page.getByRole('heading', { name: 'Nhật ký thao tác' })).toBeVisible();

  await expect
    .poll(async () => {
      const response = await page.request.get('/api/v1/audit-logs', {
        params: {
          action: 'CREATE',
          entity: 'Customer',
          take: 20,
        },
      });
      const logs = (await response.json()) as Array<{ after?: { fullName?: string } }>;
      return logs.some((log) => log.after?.fullName === customerName);
    })
    .toBe(true);

  await page.getByLabel('Action').selectOption('CREATE');
  await page.getByLabel('Entity').selectOption('Customer');
  await page.getByRole('button', { name: 'Tìm' }).click();

  const row = page.getByRole('row', { name: /CREATE Customer/ }).first();
  await expect(row).toBeVisible();
  await row.getByLabel(/Xem audit/).click();

  const dialog = page.getByRole('dialog', { name: 'Audit CREATE Customer' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(customerName)).toBeVisible();
  await expect(dialog.getByText(customerPhone)).toBeVisible();
});

async function postJson<T = unknown>(page: Page, url: string, data: unknown): Promise<T> {
  const response = await page.request.post(url, { data });
  expect(response.ok()).toBeTruthy();
  return response.json() as Promise<T>;
}
