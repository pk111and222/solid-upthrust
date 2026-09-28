import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'
import { paintedColor } from '../../utils/color-browser'

const path = 'components/navigation/menu/'
async function demo(page: Page, info: TestInfo, name: string) {
  if (!page.url().includes(info.project.name === 'docs' ? path : '/Menu')) await page.goto(info.project.name === 'docs' ? path : 'Menu')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="menu/${name}"]` : `[data-menu-demo="${name}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  await expect(area.getByRole('menu').first()).toBeVisible()
  return area
}
type Box = { x: number; y: number; width: number; height: number; right: number; bottom: number }
const box = (locator: Locator): Promise<Box> => locator.evaluate(el => {
  const r = el.getBoundingClientRect()
  return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }
})
const item = (scope: Locator | Page, name: string) => scope.getByRole('menuitem', { name, exact: true })
const shot = (area: Locator, info: TestInfo, name: string) => area.screenshot({ path: info.outputPath(`${name}.png`) })
/** 把 preset 颜色 token 绘制成 rgb 字符串（与 paintedColor 同一归一方式）。 */
const tokenColor = (page: Page, token: string) => page.evaluate(name => {
  const probe = document.createElement('i'); probe.style.color = `rgb(var(--upthrust-colors-${name}))`
  document.body.append(probe)
  const value = getComputedStyle(probe).color; probe.remove()
  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
  context.fillStyle = value; context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return `rgb(${r}, ${g}, ${b})`
}, token)

// 水平菜单：46px 行高、选中项 primary 文字与 2px 底部指示条；hover 子菜单在下方弹出，最小宽度不小于标题，移出后关闭。
test('[menu.browser.horizontal] indicator and hover popup', async ({ page }, info) => {
  const area = await demo(page, info, 'horizontal')
  const selected = item(area, '导航一')
  await expect(selected).toHaveCSS('line-height', '46px')
  const bar = await selected.evaluate(el => getComputedStyle(el, '::after').borderBottomWidth)
  expect(bar).toBe('2px')
  await expect(item(area, '导航二')).toHaveAttribute('aria-disabled', 'true')
  const title = item(area, '导航三 - 子菜单')
  await title.hover()
  await expect(title).toHaveAttribute('aria-expanded', 'true')
  const popup = page.locator(`[id="${await title.getAttribute('aria-controls')}"]`)
  await expect(popup).toBeVisible()
  // 弹层经 scale 过渡入场，轮询到稳定位置；标题有 1px 上移，允许 2px 误差。
  await expect.poll(async () => (await box(popup)).y - (await box(title)).bottom).toBeGreaterThan(-2)
  const [t, p] = await Promise.all([box(title), box(popup)])
  expect(p.width).toBeGreaterThanOrEqual(Math.max(160, t.width) - 1)
  await page.screenshot({ path: info.outputPath('horizontal-open.png') })
  await item(popup, '选项 1').click()
  await expect(title).toHaveAttribute('aria-expanded', 'false')
  { const expected = await tokenColor(page, 'primary'); await expect.poll(() => paintedColor(title, 'color')).toBe(expected) }
})

// 深色水平：选中整块 primary 底色，无底边框。
test('[menu.browser.horizontalDark] selected background', async ({ page }, info) => {
  const area = await demo(page, info, 'horizontal-dark')
  await expect(area.getByRole('menu').first()).toHaveCSS('border-bottom-width', '0px')
  await expect(item(area, '导航一')).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await shot(area, info, 'horizontal-dark')
})

// inline：40px 项高、层级缩进 24/48px；点击标题展开，箭头旋转；点击路径叶子在前。
test('[menu.browser.inline] indent, expand and keyPath', async ({ page }, info) => {
  const area = await demo(page, info, 'inline')
  const option = item(area, '选项 1')
  await expect(option).toHaveCSS('height', '40px')
  await expect(option).toHaveCSS('padding-left', '48px')
  await expect(item(area, '导航一')).toHaveCSS('padding-left', '24px')
  const sub2 = item(area, '导航二')
  await sub2.click()
  await expect(sub2).toHaveAttribute('aria-expanded', 'true')
  await item(area, '子菜单').click()
  await item(area, '选项 7').click()
  await expect(area.locator('output')).toHaveText('点击路径：7 ← sub3 ← sub2')
  await expect(item(area, '选项 7')).toHaveCSS('padding-left', '72px')
  await shot(area, info, 'inline')
})

// 收起：宽度过渡到 80px，一级文字归零；悬浮一级项显示右侧提示；子菜单改为右侧弹出。
test('[menu.browser.collapsed] width, tooltip and popup', async ({ page }, info) => {
  const area = await demo(page, info, 'inline-collapsed')
  const menu = area.getByRole('menu').first()
  await area.getByRole('button', { name: '收起菜单' }).click()
  await expect.poll(async () => (await box(menu)).width).toBeCloseTo(80, 0)
  const first = item(area, '选项 1')
  await first.hover()
  const tip = page.getByRole('tooltip').filter({ hasText: '选项 1' })
  await expect(tip).toBeVisible()
  const [f, t] = await Promise.all([box(first), box(tip)])
  expect(t.x).toBeGreaterThanOrEqual(f.right - 1)
  const sub = item(area, '导航一')
  await sub.hover()
  const popup = page.locator(`[id="${await sub.getAttribute('aria-controls')}"]`)
  await expect(popup).toBeVisible()
  expect((await box(popup)).x).toBeGreaterThanOrEqual((await box(sub)).right - 1)
  await shot(area, info, 'collapsed')
  await area.getByRole('button', { name: '展开菜单' }).click()
  await expect.poll(async () => (await box(menu)).width).toBeCloseTo(256, 0)
  await expect(sub).toHaveAttribute('aria-expanded', 'true')
})

// tooltip placement=left：提示出现在菜单项左侧。
test('[menu.browser.tooltip] placement override', async ({ page }, info) => {
  const area = await demo(page, info, 'tooltip')
  const first = item(area, '选项 2')
  await first.hover()
  const tip = page.getByRole('tooltip').filter({ hasText: '选项 2' })
  await expect(tip).toBeVisible()
  expect((await box(tip)).right).toBeLessThanOrEqual((await box(first)).x + 1)
})

// vertical 嵌套弹层：hover 二级再 hover 三级，三级弹层在二级右侧；键盘 → 打开并聚焦首项，← 关闭回到标题。
test('[menu.browser.vertical] nested popup and keyboard', async ({ page }, info) => {
  const area = await demo(page, info, 'vertical')
  const sub2 = item(area, '导航二')
  await sub2.hover()
  const second = page.locator(`[id="${await sub2.getAttribute('aria-controls')}"]`)
  const nested = item(second, '子菜单')
  await nested.hover()
  const third = page.locator(`[id="${await nested.getAttribute('aria-controls')}"]`)
  await expect(third).toBeVisible()
  expect((await box(third)).x).toBeGreaterThanOrEqual((await box(nested)).right - 1)
  await page.screenshot({ path: info.outputPath('vertical-nested.png') })
  await page.mouse.move(0, 0)
  await expect(third).toBeHidden()

  await sub2.focus()
  await page.keyboard.press('ArrowRight')
  await expect(item(second, '选项 5')).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(sub2).toBeFocused()
  await expect(sub2).toHaveAttribute('aria-expanded', 'false')
})

// 深色 inline：文字 65% 透明度、选中 primary 底色白字，切换浅色后选中变 primary 文字。
test('[menu.browser.theme] dark readability', async ({ page }, info) => {
  const area = await demo(page, info, 'theme')
  const selected = item(area, '选项 1')
  { const expected = await tokenColor(page, 'primary'); await expect.poll(() => paintedColor(selected, 'background-color')).toBe(expected) }
  { const expected = await tokenColor(page, 'inverse-surface'); await expect.poll(() => paintedColor(item(area, '选项 2'), 'color')).not.toBe(expected) }
  await shot(area, info, 'theme-dark')
  await area.getByRole('switch').click()
  { const expected = await tokenColor(page, 'primary'); await expect.poll(() => paintedColor(selected, 'color')).toBe(expected) }
})

// 切换模式：inline → vertical 清空展开项，回到 inline 恢复。
test('[menu.browser.switchMode] cached open keys', async ({ page }, info) => {
  const area = await demo(page, info, 'switch-mode')
  const sub = item(area, '导航一')
  await expect(sub).toHaveAttribute('aria-expanded', 'true')
  await area.getByRole('switch').first().click()
  await expect(sub).toHaveAttribute('aria-expanded', 'false')
  await area.getByRole('switch').first().click()
  await expect(sub).toHaveAttribute('aria-expanded', 'true')
})

// 多选 + 点击触发：点击标题打开，外部点击关闭；再次点击选中项取消。
test('[menu.browser.multiple] click trigger and deselect', async ({ page }, info) => {
  const area = await demo(page, info, 'multiple')
  await item(area, '选项 B').click()
  await expect(area.locator('output')).toHaveText('a, b；选中 b')
  await item(area, '选项 A').click()
  await expect(area.locator('output')).toHaveText('b；取消 a')
  const title = item(area, '点击展开')
  await title.hover()
  await expect(title).toHaveAttribute('aria-expanded', 'false')
  await title.click()
  await expect(title).toHaveAttribute('aria-expanded', 'true')
  await item(page.locator(`[id="${await title.getAttribute('aria-controls')}"]`), '选项 C').click()
  await expect(area.locator('output')).toHaveText('b, c；选中 c')
  await page.mouse.click(5, 5)
  await expect(title).toHaveAttribute('aria-expanded', 'false')
})

// 自定义弹层：popupRender 收到根到子菜单的 keys；extra 右对齐，危险项 error 色。
test('[menu.browser.popupRender] custom popup and extra', async ({ page }, info) => {
  const area = await demo(page, info, 'custom-popup-render')
  await item(area, '特性').hover()
  const custom = page.locator('[data-popup-keys="features"]')
  await expect(custom).toBeVisible()
  await expect(custom).toContainText('主题定制')
  const extra = await demo(page, info, 'extra')
  const profile = item(extra, '个人资料 ⌘P')
  const [row, key] = await Promise.all([box(profile), box(profile.getByText('⌘P'))])
  expect(row.right - key.right).toBeGreaterThan(15)
  expect(row.right - key.right).toBeLessThan(40)
  { const expected = await tokenColor(page, 'error'); await expect.poll(() => paintedColor(item(extra, '退出登录'), 'color')).toBe(expected) }
  await shot(extra, info, 'extra')
})
