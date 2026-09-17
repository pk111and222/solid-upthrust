import { defineConfig, devices } from '@playwright/test'
import { resolve } from 'node:path'
export default defineConfig({
  testDir:'./browser',
  testMatch:['Drawer/example.spec.ts','Empty/example.spec.ts'],
  outputDir:'./test-results/typecheck',
  use:{...devices['Desktop Chrome'],baseURL:'http://127.0.0.1:4174/',launchOptions:{executablePath:process.env.DOCS_CHROMIUM_PATH}},
  webServer:{command:'pnpm exec vite preview --host 127.0.0.1 --port 4174 --strictPort',cwd:resolve(import.meta.dirname,'../../example'),url:'http://127.0.0.1:4174/',reuseExistingServer:false},
})
