import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/layout/flex/'
async function demo(page: Page, info: TestInfo, id: string) {
  await page.goto(info.project.name === 'docs' ? path : 'Flex')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="flex/${id}"]` : `[data-flex-demo="${id}"]`)
  await expect(area.locator('[class*="flex"]').first()).toBeVisible()
  return area
}
/** 返回容器内边框盒与各直接子元素的几何信息（相对视口）。 */
const layout = (container: Locator) => container.evaluate(el => {
  const rect = (node: Element) => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom } }
  const style = getComputedStyle(el)
  const inner = rect(el)
  return {
    // 去掉边框后的内容盒（本组示例容器没有内边距）。
    box: (() => {
      const x = inner.x + parseFloat(style.borderLeftWidth), right = inner.right - parseFloat(style.borderRightWidth)
      const y = inner.y + parseFloat(style.borderTopWidth), bottom = inner.bottom - parseFloat(style.borderBottomWidth)
      return { x, y, right, bottom, w: right - x, h: bottom - y }
    })(),
    items: [...el.children].map(rect),
  }
})
const near = (actual: number, expected: number, tolerance = 0.6) => expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThan(tolerance)

// 默认横向：四块同一行、各占 1/4；切换 orientation=vertical 后纵向堆叠，交叉轴拉伸到容器宽度。
test('[flex.browser.direction] horizontal row and vertical stack', async ({ page }, info) => {
  const area = await demo(page, info, 'basic'), flex = area.locator('[data-flex-basic]')
  await expect(flex).toHaveCSS('flex-direction', 'row')
  let { box, items } = await layout(flex)
  expect(items).toHaveLength(4)
  for (const [index, item] of items.entries()) { near(item.y, box.y); near(item.w, box.w / 4); near(item.x, box.x + index * box.w / 4) }
  await area.getByRole('radio', { name: '垂直 vertical' }).click()
  await expect(flex).toHaveCSS('flex-direction', 'column')
  ;({ box, items } = await layout(flex))
  for (const [index, item] of items.entries()) { near(item.x, box.x); near(item.w, box.w); near(item.h, 54); near(item.y, box.y + index * 54) }
  await area.screenshot({ path: info.outputPath('direction.png') })
})

// 预设间距在真实浏览器中是 8/16/24px，自定义数字按 px 生效，0 也生效。
test('[flex.browser.gap] preset and custom gap sizes', async ({ page }, info) => {
  const area = await demo(page, info, 'gap'), flex = area.locator('[data-flex-gap]')
  const spacing = async () => { const { items } = await layout(flex); return items.slice(1).map((item, index) => item.x - items[index].right) }
  for (const [label, px] of [['small 8px', 8], ['middle 16px', 16], ['large 24px', 24]] as const) {
    await area.getByRole('radio', { name: label }).click()
    await expect(flex).toHaveCSS('column-gap', `${px}px`)
    for (const gap of await spacing()) near(gap, px)
  }
  await area.getByRole('radio', { name: '自定义' }).click()
  await expect(flex).toHaveCSS('column-gap', '0px')
  for (const gap of await spacing()) near(gap, 0)
  const slider = area.getByRole('slider', { name: '自定义间距' })
  await slider.focus()
  for (let step = 0; step < 5; step++) await slider.press('ArrowRight')
  await expect(flex).toHaveCSS('column-gap', '5px')
  expect(await flex.evaluate(el => (el as HTMLElement).style.gap)).toBe('5px')
  for (const gap of await spacing()) near(gap, 5)
  await area.screenshot({ path: info.outputPath('gap.png') })
})

// wrap 多行排列；nowrap 全部同一行；wrap-reverse 首项落在最后一行。
test('[flex.browser.wrap] wrap nowrap and wrap-reverse rows', async ({ page }, info) => {
  const area = await demo(page, info, 'wrap'), flex = area.locator('[data-flex-wrap]')
  const rows = async () => { const { items } = await layout(flex); return { items, rows: new Set(items.map(item => Math.round(item.y))).size } }
  let state = await rows()
  expect(state.items).toHaveLength(24)
  expect(state.rows).toBeGreaterThan(1)
  near(state.items[1].y - state.items[0].y, 0)
  // 换行后的行间距同样是 small=8px。
  const secondRow = state.items.find(item => item.y > state.items[0].bottom)!
  near(secondRow.y - state.items[0].bottom, 8)
  await area.getByRole('radio', { name: 'nowrap' }).click()
  await expect(flex).toHaveCSS('flex-wrap', 'nowrap')
  state = await rows()
  expect(state.rows).toBe(1)
  await area.getByRole('radio', { name: 'wrap-reverse' }).click()
  await expect(flex).toHaveCSS('flex-wrap', 'wrap-reverse')
  state = await rows()
  expect(state.rows).toBeGreaterThan(1)
  expect(state.items[0].y).toBeGreaterThan(state.items[23].y)
  await area.screenshot({ path: info.outputPath('wrap.png') })
})

// justify 与 align 在固定高度容器内产生正确的主轴/交叉轴几何位置。
test('[flex.browser.align] justify and align geometry', async ({ page }, info) => {
  const area = await demo(page, info, 'align'), flex = area.locator('[data-flex-align]')
  const main = area.getByRole('radiogroup', { name: '主轴对齐' }), cross = area.getByRole('radiogroup', { name: '交叉轴对齐' })
  let { box, items } = await layout(flex)
  near(items[0].x, box.x); near(items[0].y, box.y)
  await main.getByRole('radio', { name: 'center', exact: true }).click()
  ;({ box, items } = await layout(flex))
  near(items[0].x - box.x, box.right - items[3].right, 1)
  await main.getByRole('radio', { name: 'flex-end' }).click()
  ;({ box, items } = await layout(flex))
  near(items[3].right, box.right)
  await main.getByRole('radio', { name: 'space-between' }).click()
  ;({ box, items } = await layout(flex))
  near(items[0].x, box.x); near(items[3].right, box.right)
  await main.getByRole('radio', { name: 'space-evenly' }).click()
  ;({ box, items } = await layout(flex))
  const gaps = [items[0].x - box.x, ...items.slice(1).map((item, index) => item.x - items[index].right), box.right - items[3].right]
  for (const gap of gaps) near(gap, gaps[0], 1)
  await cross.getByRole('radio', { name: 'center', exact: true }).click()
  ;({ box, items } = await layout(flex))
  for (const item of items) near(item.y + item.h / 2, box.y + box.h / 2, 1)
  await cross.getByRole('radio', { name: 'flex-end' }).click()
  ;({ box, items } = await layout(flex))
  for (const item of items) near(item.bottom, box.bottom)
  // baseline：不同高度的按钮文字基线对齐，因此较高按钮的顶部与普通按钮不同。
  await cross.getByRole('radio', { name: 'baseline' }).click()
  await expect(flex).toHaveCSS('align-items', 'baseline')
  ;({ items } = await layout(flex))
  expect(Math.abs(items[2].y - items[1].y)).toBeGreaterThan(4)
  await area.screenshot({ path: info.outputPath('align.png') })
})

// 所有 justify/align 关键字（含任意属性类）都在最终样式表里生成了真实 CSS。
test('[flex.browser.keywords] every justify and align keyword resolves', async ({ page }, info) => {
  await demo(page, info, 'basic')
  const resolved = await page.evaluate(() => {
    const probe = (className: string, property: 'justifyContent' | 'alignItems') => {
      const el = document.createElement('div'); el.className = `flex ${className}`; document.body.append(el)
      const value = getComputedStyle(el)[property]; el.remove(); return value
    }
    const justify = ['justify-start', 'justify-end', '[justify-content:start]', '[justify-content:end]', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly', '[justify-content:stretch]', '[justify-content:normal]', '[justify-content:left]', '[justify-content:right]']
    const align = ['items-start', 'items-end', '[align-items:start]', '[align-items:end]', '[align-items:self-start]', '[align-items:self-end]', 'items-center', 'items-baseline', 'items-stretch', '[align-items:normal]']
    return { justify: justify.map(name => probe(name, 'justifyContent')), align: align.map(name => probe(name, 'alignItems')) }
  })
  expect(resolved.justify).toEqual(['flex-start', 'flex-end', 'start', 'end', 'center', 'space-between', 'space-around', 'space-evenly', 'stretch', 'normal', 'left', 'right'])
  expect(resolved.align).toEqual(['flex-start', 'flex-end', 'start', 'end', 'self-start', 'self-end', 'center', 'baseline', 'stretch', 'normal'])
})
