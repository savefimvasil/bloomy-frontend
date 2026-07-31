import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3001';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI ? 'junit' : 'html',
  globalSetup: './e2e/global-setup.ts',

  // Raise the global expect timeout so toHaveURL() catches client-side
  // redirects that fire after React hydration + Zustand rehydration.
  expect: { timeout: 15_000 },

  use: {
    baseURL: BASE_URL,
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    trace: 'on-first-retry',
  },

  // Auto-start the Next.js dev server if it isn't already running.
  // The backend (port 3000) and Postgres must be started separately:
  //   cd bloomy-deploy && docker compose up -d postgres
  //   cd bloomy-backend && npm run start:dev
  webServer: {
    // Starts the Next.js dev server on port 3001.
    // Backend (port 3000) + Postgres must already be running:
    //   cd bloomy-deploy && docker compose up -d postgres
    //   cd bloomy-backend && npm run start:dev
    // Set reuseExistingServer: false in CI to always get a fresh server.
    command: 'npm run dev -- --port 3001',
    // Use favicon.ico as the readiness probe — it's a static file that
    // resolves before any dynamic page compilation completes.
    url: `${BASE_URL}/favicon.ico`,
    reuseExistingServer: true,
    timeout: 300_000,
    stdout: 'ignore',
    stderr: 'ignore',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      grep: /@smoke/,
    },
  ],
  outputDir: 'playwright-results/',
});
