import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/results.xml' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'api', testMatch: '**/api/**/*.spec.ts' },
    { name: 'chromium', testMatch: '**/ui/**/*.spec.ts', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testMatch: '**/ui/**/*.spec.ts', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testMatch: '**/ui/**/*.spec.ts', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://127.0.0.1:4173/health',
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
