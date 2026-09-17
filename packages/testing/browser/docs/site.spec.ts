import { expect, test } from '@playwright/test'

test('docs.ssr: deep-page HTML contains prose and escaped example source before JS', async ({ request }) => {
  const response = await request.get('guide/rendering/')
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).toContain('正文与源码由 SSR 提供')
  expect(html.replace(/<[^>]*>/g, '')).toContain('import Button from')
  expect(html).toContain('&lt;Button')
  expect(html).not.toContain('<Button type=')
  expect(html).toContain('data-demo-state="pending"')
  expect(html).not.toContain('已点击 0 次</output>')
})

test('docs.ssr: disabled JavaScript still renders styled text, source and navigation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  try {
    const page = await context.newPage()
    await page.goto('guide/rendering/')
    await expect(page.getByRole('heading', { name: '文档与示例渲染', exact: true })).toBeVisible()
    await expect(page.locator('pre code')).toContainText('import Button from')
    await expect(page.locator('noscript p')).toContainText('请启用 JavaScript')
    await expect(page.getByRole('button', { name: '点击计数' })).toHaveCount(0)
    const fontSize = await page.locator('h1').evaluate(element => getComputedStyle(element).fontSize)
    expect(parseFloat(fontSize)).toBeGreaterThan(24)
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '组件', exact: true }).click()
    await expect(page.getByRole('heading', { name: '组件总览', exact: true })).toBeVisible()
  } finally { await context.close() }
})

test('docs.csr: real Button mounts and interacts without replacing SSR content', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('guide/rendering/')
  const heading = page.getByRole('heading', { name: '文档与示例渲染', exact: true })
  await expect(heading).toBeVisible()
  await expect(page.locator('[data-demo-state="ready"]')).toBeVisible()
  const button = page.getByRole('button', { name: '点击计数', exact: true })
  await expect(button).toHaveCSS('height', '32px')
  await button.click()
  await expect(page.locator('output')).toHaveText('已点击 1 次')
  await button.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('output')).toHaveText('已点击 2 次')
  await expect(page.locator('pre code')).toContainText('onClick={() => setCount')
  await page.reload()
  await expect(page.locator('output')).toHaveText('已点击 0 次')
  expect(errors).toEqual([])
})

test('docs.routing: all discovered pages and same-origin assets resolve under the base', async ({ request, baseURL }) => {
  const manifestResponse = await request.get('routes.json')
  const manifest = await manifestResponse.json() as { base: string; routes: { path: string; title: string }[] }
  expect(manifest.base).toBe(new URL(baseURL!).pathname)
  for (const route of manifest.routes) {
    const response = await request.get(route.path.slice(1))
    expect(response.status(), route.path).toBe(200)
    const html = await response.text()
    expect(html).toContain(`${route.title} · Solid Upthrust`)
    for (const [, asset] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (asset.startsWith('#') || /^https?:\/\//.test(asset)) continue
      expect(asset.startsWith(manifest.base), asset).toBe(true)
      expect((await request.get(asset)).status(), asset).toBe(200)
    }
  }
})

test('docs.routing: unknown documents are real 404s with useful navigation', async ({ page }) => {
  const response = await page.goto('not-a-page/')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: '页面未找到', exact: true })).toBeVisible()
  await page.getByRole('link', { name: '返回文档首页', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Solid Upthrust', exact: true })).toBeVisible()
})

test('docs.csr: a failed client chunk leaves readable docs and an explicit demo fallback', async ({ page }) => {
  await page.route('**/assets/button-*.js', route => route.abort())
  await page.goto('guide/rendering/')
  await expect(page.getByRole('alert')).toContainText('示例加载失败')
  await expect(page.getByRole('heading', { name: '正文与源码由 SSR 提供' })).toBeVisible()
  await expect(page.locator('pre code')).toContainText('import Button from')
})
