import { defineConfig, devices } from '@playwright/test';

const frontendPort = Number(process.env.PLAYWRIGHT_FRONTEND_PORT ?? 5173);
const backendPort = Number(process.env.PLAYWRIGHT_BACKEND_PORT ?? 3000);

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  workers: 1,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${frontendPort}`,
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${frontendPort}`,
      url: `http://127.0.0.1:${frontendPort}`,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: `npm run dev --prefix ../backend`,
      url: `http://127.0.0.1:${backendPort}/api/v1/health`,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
