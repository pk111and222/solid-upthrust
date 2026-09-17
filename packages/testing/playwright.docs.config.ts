import { defineConfig, devices } from '@playwright/test'
import { resolve } from 'node:path'

const base = process.env.DOCS_BASE ?? '/'
const port = 4173
export default defineConfig({
  testDir: './browser/docs',
  testMatch: '**/*.spec.ts',
  outputDir: './test-results/docs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://127.0.0.1:${port}${base}`,
    trace: 'retain-on-failure',
    launchOptions: { executablePath: process.env.DOCS_CHROMIUM_PATH },
  },
  webServer: [{
    command: 'node scripts/preview.mjs',
    cwd: resolve(import.meta.dirname, '../../docs'),
    env: { DOCS_PORT: String(port) },
    url: `http://127.0.0.1:${port}${base}`,
    reuseExistingServer: false,
    timeout: 15_000,
  }, {
    command: 'pnpm exec vite --host 127.0.0.1 --port 5658',
    cwd: resolve(import.meta.dirname, '../../docs'),
    url: `http://127.0.0.1:5658${base}`,
    reuseExistingServer: false,
    timeout: 15_000,
  }],
})
