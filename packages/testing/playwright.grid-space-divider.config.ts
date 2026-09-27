import { defineConfig } from '@playwright/test'
import { resolve } from 'node:path'
import docs from './playwright.docs.config'

// Grid / Space / Divider 的浏览器回归：同一组用例分别跑文档站与 example 预览；dev/ssr/mobile 只在文档站跑。
export default defineConfig({
  ...docs,
  testDir: './browser',
  testMatch: ['Grid/*.spec.ts', 'Space/*.spec.ts', 'Divider/*.spec.ts'],
  projects: [
    { name: 'docs' },
    { name: 'example', grepInvert: /\.browser\.(dev|ssr|mobile)\]/, use: { baseURL: 'http://127.0.0.1:4174/' } },
  ],
  webServer: [
    ...(Array.isArray(docs.webServer) ? docs.webServer : []),
    {
      command: 'pnpm exec vite preview --host 127.0.0.1 --port 4174 --strictPort',
      cwd: resolve(import.meta.dirname, '../../example'),
      url: 'http://127.0.0.1:4174/',
      reuseExistingServer: false,
    },
  ],
  outputDir: './test-results/grid-space-divider',
})
