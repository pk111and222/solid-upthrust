import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/layout/space/'
async function demo(page: Page, info: TestInfo, id: string) {
  await page.goto(info.project.name === 'docs' ? path : 'Space')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="space/${id}"]` : `[data-space-demo="${id}"]`)
  await expect(area.locator('[class*="flex"]').first()).toBeVisible()
  return area
}
type Rect = { x: number; y: number; w: number; h: number; right: number; bottom: number }
/** 容器与各直接子元素（子项包裹层 / 分隔符 / Compact 子控件）的几何信息。 */
const layout = (container: Locator) => container.evaluate(el => {
  const rect = (node: Element): Rect => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom } }
  return { box: rect(el), items: [...el.children].map(node => ({ ...rect(node), cls: node.className.toString(), text: (node.textContent ?? '').trim() })) }
})
/** 同一行相邻元素之间的水平间隔。 */
const gapsX = (items: Rect[]) => items.slice(1).map((item, i) => item.x - items[i].right)
/** 父元素内容区宽度（去掉内边距；文档示例容器带 32px 左右内边距）。 */
const contentWidth = (target: Locator) => target.evaluate(el => {
  const parent = el.parentElement!, s = getComputedStyle(parent)
  return parent.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight)
})
const near = (actual: number, expected: number, tolerance = 0.6) => expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThan(tolerance)
/** 读取元素的若干计算样式。 */
const css = (target: Locator, ...names: string[]) => target.evaluate((el, keys) => {
  const style = getComputedStyle(el)
  return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]))
}, names)

// 默认 small：子项之间 8px；false 不产生子项，数字 0 正常渲染，共 5 个子项。
test('[space.browser.base] default 8px gap, falsy children skipped and 0 kept', async ({ page }, info) => {
  const area = await demo(page, info, 'base')
  const { box, items } = await layout(area.locator('[data-space-base]'))
  expect(items.map(item => item.text)).toEqual(['默认间距 8px', '主按钮', '次按钮', '虚线按钮', '0'])
  for (const item of items) expect(item.cls).toContain('space-item')
  for (const gap of gapsX(items)) near(gap, 8)
  // inline-flex：宽度由内容决定。文档示例容器是 flex-col，会把它块级化并拉伸到整行，所以文档站只断言类名，
  // example 页（普通块级父容器）再断言宽度正好收缩到内容。
  await expect(area.locator('[data-space-base]')).toHaveClass(/(^|\s)inline-flex(\s|$)/)
  if (info.project.name === 'example') near(box.w, items[4].right - items[0].x)
  for (const item of items) near(item.y + item.h / 2, box.y + box.h / 2, 1)
  await area.screenshot({ path: info.outputPath('base.png') })
})

// 纵向 middle：卡片之间 16px 行距，左侧对齐。
test('[space.browser.vertical] vertical stack with 16px row gap', async ({ page }, info) => {
  const area = await demo(page, info, 'vertical')
  const { box, items } = await layout(area.locator('[data-space-vertical]'))
  expect(items).toHaveLength(3)
  for (let i = 1; i < items.length; i++) near(items[i].y - items[i - 1].bottom, 16)
  for (const item of items) near(item.x, box.x)
})

// 间距档位切换：small 8 / middle 16 / large 24；自定义时出现滑块，默认 40，键盘步进后实时更新。
test('[space.browser.size] presets and custom size', async ({ page }, info) => {
  const area = await demo(page, info, 'size')
  const space = area.locator('[data-space-size]')
  const gaps = async () => gapsX((await layout(space)).items)
  for (const gap of await gaps()) near(gap, 8)
  for (const [label, px] of [['middle 16px', 16], ['large 24px', 24], ['small 8px', 8]] as const) {
    await area.getByRole('radio', { name: label }).click()
    await expect.poll(async () => (await gaps()).map(Math.round), { message: label }).toEqual([px, px, px])
  }
  await expect(area.getByRole('slider', { name: '自定义间距' })).toHaveCount(0)
  await area.getByRole('radio', { name: '自定义' }).click()
  const slider = area.getByRole('slider', { name: '自定义间距' })
  await expect(slider).toBeVisible()
  await expect(space).toHaveCSS('gap', '40px')
  await slider.focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await expect(space).toHaveCSS('gap', '42px')
  for (const gap of await gaps()) near(gap, 42)
  await area.screenshot({ path: info.outputPath('size-custom.png') })
})

// align：start 顶对齐、end 底对齐、center 中线对齐、baseline 文字基线对齐。
test('[space.browser.align] cross-axis alignment', async ({ page }, info) => {
  const area = await demo(page, info, 'align')
  const read = (align: string) => layout(area.locator(`[data-space-align="${align}"] > div`))
  let { box, items } = await read('start')
  for (const item of items) near(item.y, box.y)
  ;({ box, items } = await read('end'))
  for (const item of items) near(item.bottom, box.bottom)
  ;({ box, items } = await read('center'))
  for (const item of items) near(item.y + item.h / 2, box.y + box.h / 2, 1)
  const baseline = area.locator('[data-space-align="baseline"] > div')
  await expect(baseline).toHaveCSS('align-items', 'baseline')
  // 基线对齐时三个子项高度不同，顶边不再齐平。
  ;({ items } = await layout(baseline))
  expect(new Set(items.map(item => Math.round(item.y))).size).toBeGreaterThan(1)
  await area.screenshot({ path: info.outputPath('align.png') })
})

// wrap + [8, 16]：同一行水平间隔 8px，换行后行距 16px，且不溢出父容器。
test('[space.browser.wrap] wraps with separate column and row gaps', async ({ page }, info) => {
  const area = await demo(page, info, 'wrap')
  const space = area.locator('[data-space-wrap]')
  await expect(space).toHaveCSS('column-gap', '8px')
  await expect(space).toHaveCSS('row-gap', '16px')
  const { box, items } = await layout(space)
  expect(items).toHaveLength(20)
  const rows = [...new Set(items.map(item => Math.round(item.y)))]
  expect(rows.length).toBeGreaterThan(1)
  for (let i = 1; i < rows.length; i++) near(rows[i] - rows[i - 1], items[0].h + 16, 1)
  for (const row of rows) {
    const line = items.filter(item => Math.round(item.y) === row)
    for (const gap of gapsX(line)) near(gap, 8)
  }
  for (const item of items) expect(item.right).toBeLessThanOrEqual(box.right + 0.5)
})

// 分隔符只出现在子项之间：3 个子项 → 2 个分隔符；split 旧名称效果相同。
test('[space.browser.separator] separators only between items', async ({ page }, info) => {
  const area = await demo(page, info, 'separator')
  for (const selector of ['[data-space-separator]', '[data-space-split]']) {
    const { items } = await layout(area.locator(selector))
    expect(items.map(item => item.cls.includes('space-separator') ? 'sep' : 'item'), selector).toEqual(['item', 'sep', 'item', 'sep', 'item'])
    for (const gap of gapsX(items)) near(gap, 8)
  }
  // 竖向 Divider 作为分隔符：1px 左边框、自身左右 8px 外边距。
  const divider = area.locator('[data-space-separator] [role="separator"]').first()
  await expect(divider).toHaveAttribute('aria-orientation', 'vertical')
  await expect(divider).toHaveCSS('border-left-width', '1px')
  await expect(area.locator('[data-space-split] .space-separator').first()).toHaveText('/')
})

// Compact 水平：相邻子控件 -1px 重叠，首项去右侧圆角、末项去左侧圆角、中间项无圆角；单子元素保留全部圆角。
test('[space.browser.compact.buttons] horizontal compact merges borders and corners', async ({ page }, info) => {
  const area = await demo(page, info, 'compact-buttons')
  for (const key of ['buttons', 'primary']) {
    const compact = area.locator(`[data-compact="${key}"]`)
    const { items } = await layout(compact)
    expect(items).toHaveLength(3)
    for (const gap of gapsX(items)) near(gap, -1)
    const children = compact.locator('> *')
    expect(await css(children.nth(0), 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius'))
      .toEqual({ 'border-top-left-radius': '6px', 'border-top-right-radius': '0px', 'border-bottom-right-radius': '0px' })
    expect(await css(children.nth(1), 'border-top-left-radius', 'border-top-right-radius'))
      .toEqual({ 'border-top-left-radius': '0px', 'border-top-right-radius': '0px' })
    expect(await css(children.nth(2), 'border-top-left-radius', 'border-bottom-left-radius', 'border-top-right-radius'))
      .toEqual({ 'border-top-left-radius': '0px', 'border-bottom-left-radius': '0px', 'border-top-right-radius': '6px' })
  }
  const single = area.locator('[data-compact="single"] > *')
  expect(await css(single, 'border-top-left-radius', 'border-top-right-radius')).toEqual({ 'border-top-left-radius': '6px', 'border-top-right-radius': '6px' })
  // 悬停中间按钮时提升层级，高亮边框不被右侧邻居盖住。
  const middle = area.locator('[data-compact="buttons"] > *').nth(1)
  await middle.hover()
  await expect(middle).toHaveCSS('z-index', '1')
  await expect(area.locator('[data-compact="buttons"] > *').nth(2)).not.toHaveCSS('z-index', '1')
  await area.screenshot({ path: info.outputPath('compact-buttons.png') })
})

// Compact 与输入类控件：Input / Select 与按钮等高对齐、边框重叠；block 时撑满并由 flex-1 的输入框填充剩余宽度。
test('[space.browser.compact.inputs] input compact and block', async ({ page }, info) => {
  const area = await demo(page, info, 'compact')
  for (const key of ['search', 'select']) {
    const { items } = await layout(area.locator(`[data-compact="${key}"]`))
    expect(items).toHaveLength(2)
    near(items[1].x, items[0].right - 1)
    near(items[0].h, items[1].h)
    near(items[0].y, items[1].y)
  }
  const first = area.locator('[data-compact="search"] > *').first()
  expect(await css(first, 'border-top-right-radius', 'border-top-left-radius')).toEqual({ 'border-top-right-radius': '0px', 'border-top-left-radius': '6px' })
  // 无前后缀的 Input 边框画在内部 input 上：内侧圆角必须同样去掉（回归：此前内部 input 仍是 6px）。
  expect(await css(first.locator('input'), 'border-top-right-radius', 'border-bottom-right-radius', 'border-top-left-radius', 'border-bottom-left-radius'))
    .toEqual({ 'border-top-right-radius': '0px', 'border-bottom-right-radius': '0px', 'border-top-left-radius': '6px', 'border-bottom-left-radius': '6px' })
  // Select + Input：Select 的边框外沿右侧直角，Input 的内部 input 左侧直角、右侧保留圆角。
  const select = area.locator('[data-compact="select"] > *')
  const frames = await select.evaluateAll(els => els.map(el => {
    // 取子树中第一个真正画了边框的元素。
    const framed = [el, ...el.querySelectorAll('*')].find(node => parseFloat(getComputedStyle(node).borderTopWidth) > 0)!
    const s = getComputedStyle(framed)
    return [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomLeftRadius, s.borderBottomRightRadius]
  }))
  expect(frames).toEqual([['6px', '0px', '6px', '0px'], ['0px', '6px', '0px', '6px']])
  // 输入框聚焦时同样提升层级。
  await first.locator('input').focus()
  await expect(first).toHaveCSS('z-index', '1')
  const block = area.locator('[data-compact="block"]')
  const { box, items } = await layout(block)
  near(box.w, await contentWidth(block))
  near(items[1].right, box.right)
  near(items[0].x, box.x)
  await area.screenshot({ path: info.outputPath('compact.png') })
})

// Compact 纵向：相邻子控件上移 1px，首项去下侧圆角、末项去上侧圆角，左边缘对齐。
test('[space.browser.compact.vertical] vertical compact', async ({ page }, info) => {
  const area = await demo(page, info, 'compact-vertical')
  const compact = area.locator('[data-compact="vertical"]')
  const { items } = await layout(compact)
  expect(items).toHaveLength(3)
  for (let i = 1; i < items.length; i++) { near(items[i].y, items[i - 1].bottom - 1); near(items[i].x, items[0].x) }
  const children = compact.locator('> *')
  expect(await css(children.nth(0), 'border-top-left-radius', 'border-bottom-left-radius', 'border-bottom-right-radius'))
    .toEqual({ 'border-top-left-radius': '6px', 'border-bottom-left-radius': '0px', 'border-bottom-right-radius': '0px' })
  expect(await css(children.nth(2), 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius'))
    .toEqual({ 'border-top-left-radius': '0px', 'border-top-right-radius': '0px', 'border-bottom-left-radius': '6px' })
  await area.screenshot({ path: info.outputPath('compact-vertical.png') })
})

// Addon：与输入框等高、边框相接，首尾圆角由 Compact 处理。
test('[space.browser.addon] addon sits flush with the input', async ({ page }, info) => {
  const area = await demo(page, info, 'addon')
  const compact = area.locator('[data-compact="addon"]')
  const { items } = await layout(compact)
  expect(items.map(item => item.text)).toEqual(['https://', '', '.cn'])
  for (const item of items) { near(item.h, items[1].h); near(item.y, items[1].y) }
  for (const gap of gapsX(items)) near(gap, -1)
  const addon = compact.locator('> *').first()
  expect(await css(addon, 'border-top-width', 'border-top-right-radius', 'border-top-left-radius', 'white-space'))
    .toEqual({ 'border-top-width': '1px', 'border-top-right-radius': '0px', 'border-top-left-radius': '6px', 'white-space': 'nowrap' })
  // 夹在两个 Addon 中间的 Input：内部 input 的四角都是直角。
  const radii = await css(compact.locator('input'), 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius')
  expect(new Set(Object.values(radii))).toEqual(new Set(['0px']))
  await area.screenshot({ path: info.outputPath('addon.png') })
})

// 语义化：classNames / styles 分别落到根、子项与分隔符上。
test('[space.browser.semantic] classNames and styles reach each part', async ({ page }, info) => {
  const area = await demo(page, info, 'semantic')
  const space = area.locator('[data-space-semantic]')
  await expect(space).toHaveCSS('padding-left', '8px')
  const items = space.locator('> .space-item')
  const separators = space.locator('> .space-separator')
  await expect(items).toHaveCount(3)
  await expect(separators).toHaveCount(2)
  await expect(items.first()).toHaveCSS('font-variant-numeric', 'tabular-nums')
  const itemStyle = await css(items.first(), 'background-color', 'color', 'padding-left')
  expect(itemStyle['background-color']).not.toBe('rgba(0, 0, 0, 0)')
  expect(itemStyle['padding-left']).toBe('8px')
  const separatorColor = (await css(separators.first(), 'color')).color
  expect(separatorColor).not.toBe(itemStyle.color)
})

// block + 纵向：Space 撑满父容器，block 按钮随子项宽度撑满。
test('[space.browser.block] block space fills its parent', async ({ page }, info) => {
  const area = await demo(page, info, 'block')
  const space = area.locator('[data-space-block]')
  await expect(space).toHaveCSS('display', 'flex')
  const { box, items } = await layout(space)
  near(box.w, await contentWidth(space))
  for (const item of items) near(item.w, box.w)
  const buttons = await space.locator('button').evaluateAll(els => els.map(el => el.getBoundingClientRect().width))
  for (const width of buttons) near(width, box.w)
})

// 手机宽度：wrap 示例在窄屏内换行，页面无横向滚动，间距 Segmented 在滚动容器内。
test('[space.browser.mobile] no horizontal overflow on phones', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const area = await demo(page, info, 'wrap')
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)
  const group = page.locator('[data-demo="space/size"] [role="radiogroup"]')
  await expect(group.locator('..')).toHaveCSS('overflow-x', 'auto')
  await area.screenshot({ path: info.outputPath('mobile.png') })
})

// 开发模式（未经构建）：预设间距类与 Compact 的子选择器类都生成。
test('[space.browser.dev] development styles resolve', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE ?? '/'}${path}`)
  await expect(page.locator('[data-demo="space/vertical"] [data-space-vertical]')).toHaveCSS('row-gap', '16px')
  await expect(page.locator('[data-demo="space/compact-buttons"] [data-compact="buttons"] > *').first()).toHaveCSS('border-top-right-radius', '0px')
  await expect(page.locator('[data-demo="space/compact-buttons"] [data-compact="buttons"] > *').nth(1)).toHaveCSS('margin-left', '-1px')
})

// 原始静态 HTML 含 API、注意事项与示例源码（文档站示例本身在客户端渲染，静态 HTML 只断言文字与源码）。
test('[space.browser.ssr] API contracts and source', async ({ request }) => {
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  for (const text of ['Space.Compact', 'Space.Addon', '子项过滤', 'Compact 的实现', 'space/semantic', 'data-space-base', 'data-space-semantic']) expect(html).toContain(text)
})
