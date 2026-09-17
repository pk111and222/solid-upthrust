import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { writeFile, unlink } from 'node:fs/promises'
import { resolve } from 'node:path'

// The file-discovery case mutates a temporary page and triggers a full dev reload.
test.describe.configure({ mode: 'serial' })

test('docs.file-routes: adding, editing and removing a page refreshes the SSR module graph', async ({ request }) => {
  const slug = `regression-${randomUUID()}`
  const file = resolve(import.meta.dirname, '../../../../docs/src/pages', `${slug}.tsx`)
  const base = process.env.DOCS_BASE ?? '/'
  const url = `http://127.0.0.1:5658${base}${slug}/`
  const source = (text: string) => `
    export const meta = { title: 'Temporary route', description: 'File routing test', group: '研发指南', order: 999 };
    export default function Page() { return <p>${text}</p> }
  `
  const snapshot = async () => {
    const response = await request.get(url)
    return { status: response.status(), text: await response.text() }
  }
  // Warm the eager glob before adding a file, to exercise cache invalidation.
  expect((await request.get(url)).status()).toBe(404)
  let created = false
  try {
    await writeFile(file, source('route-content-one'), { flag: 'wx' })
    created = true
    await expect.poll(snapshot).toMatchObject({ status: 200, text: expect.stringContaining('route-content-one') })
    await writeFile(file, source('route-content-two'))
    await expect.poll(snapshot).toMatchObject({ status: 200, text: expect.stringContaining('route-content-two') })
  } finally {
    if (created) await unlink(file)
  }
  await expect.poll(snapshot).toMatchObject({ status: 404, text: expect.stringContaining('页面未找到') })
})

test('docs.dev: prefixed asset URLs mount examples and preserve navigation', async ({ page }) => {
  const base = process.env.DOCS_BASE ?? '/'
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`http://127.0.0.1:5658${base}guide/rendering/`)
  await expect(page).toHaveTitle('文档与示例渲染 · Solid Upthrust')
  await page.getByRole('button', { name: '点击计数', exact: true }).click()
  await expect(page.locator('output')).toHaveText('已点击 1 次')
  await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '组件', exact: true }).click()
  await expect(page).toHaveURL(`http://127.0.0.1:5658${base}components/`)
  await expect(page.getByRole('heading', { name: '组件总览', exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

// 开发模式也必须生成边框宽度，否则虚线按钮只剩阴影，看起来像实线。
test('[button.dev.dashed] 开发页面绘制一像素虚线', async ({page}) => {
  const base=process.env.DOCS_BASE ?? '/'
  await page.goto(`http://127.0.0.1:5658${base}components/general/button/`)
  const button=page.locator('[data-demo="button/basic"]').getByRole('button',{name:'虚线按钮',exact:true})
  await expect(button).toHaveCSS('border-top-style','dashed')
  await expect(button).toHaveCSS('border-top-width','1px')
  await expect(button).toHaveCSS('border-bottom-width','1px')
})
