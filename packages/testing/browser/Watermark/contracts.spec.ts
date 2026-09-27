import { test, expect, type Page, type TestInfo } from '@playwright/test'
const path = 'components/feedback/watermark/'
async function demo(page: Page, info: TestInfo, name: string) {
  if (!page.url().includes(info.project.name === 'docs' ? path : '/Watermark')) await page.goto(info.project.name === 'docs' ? path : 'Watermark')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="watermark/${name}"]` : `[data-watermark-demo="${name}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  return area
}
/** 水印节点：容器（relative + overflow hidden）中带 background-image 的子元素。 */
const markInfo = (page: Page, selector: string) => page.locator(selector).first().evaluate((holder) => {
  const mark = [...holder.children].find(el => (el as HTMLElement).style.backgroundImage) as HTMLElement | undefined
  if (!mark) return null
  const cs = getComputedStyle(mark)
  const r = mark.getBoundingClientRect(), h = holder.getBoundingClientRect()
  return { last: holder.lastElementChild === mark, z: cs.zIndex, pe: cs.pointerEvents, repeat: cs.backgroundRepeat, size: cs.backgroundSize,
    png: cs.backgroundImage.startsWith('url("data:image/png'), cover: [Math.round(r.width - h.width), Math.round(r.height - h.height)] }
})
const holderOf = (info: TestInfo, name: string) => `${info.project.name === 'docs' ? `[data-demo="watermark/${name}"]` : `[data-watermark-demo="${name}"]`} div[style*="overflow: hidden"]`

// 基本：canvas PNG 平铺、z-index 999、铺满容器、不拦截事件、为最后一个子元素。
test('[watermark.browser.basic] canvas mark covers the container', async ({ page }, info) => {
  await demo(page, info, 'basic')
  await expect.poll(() => markInfo(page, holderOf(info, 'basic'))).not.toBeNull()
  const m = (await markInfo(page, holderOf(info, 'basic')))!
  expect([m.last, m.z, m.pe, m.repeat, m.png, m.cover]).toEqual([true, '999', 'none', 'repeat', true, [0, 0]])
  // "Ant Design" 16px -22°：平铺宽 = 2 × (旋转包围盒宽 + 100)，约 2 × (~92 + 100)。
  expect(parseFloat(m.size)).toBeGreaterThan(350)
})

// 图片水印：图片加载后绘制，平铺宽 = 2 × (130 旋转包围盒宽 + 100)。
test('[watermark.browser.image] image mark', async ({ page }, info) => {
  await demo(page, info, 'image')
  await expect.poll(() => markInfo(page, holderOf(info, 'image'))).not.toBeNull()
  const a = (22 * Math.PI) / 180
  const expected = Math.floor((130 * Math.cos(a) + 30 * Math.sin(a) + 100) * 2)
  await expect.poll(async () => (await markInfo(page, holderOf(info, 'image')))?.size).toBe(`${expected}px auto`)
})

// 防篡改：删除水印节点后自动恢复。
test('[watermark.browser.tamper] removed mark is restored', async ({ page }, info) => {
  await demo(page, info, 'basic')
  const holder = page.locator(holderOf(info, 'basic')).first()
  await expect.poll(() => markInfo(page, holderOf(info, 'basic'))).not.toBeNull()
  await holder.evaluate(el => [...el.children].find(c => (c as HTMLElement).style.backgroundImage)!.remove())
  await expect.poll(() => markInfo(page, holderOf(info, 'basic'))).not.toBeNull()
  await holder.evaluate((el) => { el.style.overflow = 'visible' })
  await expect(holder).toHaveCSS('overflow', 'hidden')
})

// 弹层传导：Modal / Drawer 面板带水印；inherit={false} 的 Drawer 不带。
test('[watermark.browser.portal] modal carries mark, non-inherit drawer does not', async ({ page }, info) => {
  const area = await demo(page, info, 'portal')
  const panelMark = () => page.getByRole('dialog').evaluate(el => [...el.children].some(c => (c as HTMLElement).style.backgroundImage))
  await area.getByRole('button', { name: 'Show in Modal' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect.poll(panelMark).toBe(true)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 3000 })
  await area.getByRole('button', { name: 'Not Show in Drawer' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(await panelMark()).toBe(false)
})

// 开发服务器渲染：水印节点挂载。
test('[watermark.browser.dev] dev rendering', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658/${path}`)
  await expect.poll(() => page.locator('[data-demo="watermark/basic"] div[style*="overflow: hidden"]').first()
    .evaluate(el => [...el.children].some(c => (c as HTMLElement).style.backgroundImage))).toBe(true)
})

// API 表与示例容器在原始 HTML 中。
test('[watermark.browser.ssr] API sections are server-rendered', async ({ request }) => {
  const response = await request.get(path); expect(response.status()).toBe(200)
  const html = await response.text()
  for (const text of ['Watermark API', 'WatermarkFont', 'onRemove', 'data-demo="watermark/portal"']) expect(html).toContain(text)
})
