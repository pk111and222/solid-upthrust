import { defineConfig } from '@playwright/test'
import { resolve } from 'node:path'
import docs from './playwright.docs.config'

export default defineConfig({
  ...docs,
  testDir: './browser',
  testMatch: ['Select/*.spec.ts'],
  projects: [
    { name: 'docs' },
    { name: 'example', grepInvert: /select\.browser\.(dev|ssr)/, use: { baseURL: 'http://127.0.0.1:4174/' } },
  ],
  webServer: [...(Array.isArray(docs.webServer) ? docs.webServer : []), {
    command: 'pnpm exec vite preview --host 127.0.0.1 --port 4174 --strictPort',
    cwd: resolve(import.meta.dirname, '../../example'),
    url: 'http://127.0.0.1:4174/',
    reuseExistingServer: false,
  }],
  outputDir: './test-results/select',
})
