import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/layout/grid/'
async function demo(page: Page, info: TestInfo, id: string) {
  await page.goto(info.project.name === 'docs' ? path : 'Grid')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="grid/${id}"]` : `[data-grid-demo="${id}"]`)
  await expect(area.locator('[class*="flex"]').first()).toBeVisible()
  return area
}
/** 行容器与各直接子列的几何信息；display:none 的列宽高为 0。 */
const layout = (row: Locator) => row.evaluate(el => {
  const rect = (node: Element) => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom, text: (node.textContent ?? '').trim(), display: getComputedStyle(node).display } }
  return { row: rect(el), cols: [...el.children].map(rect) }
})
/** 列内部第一个子元素（色块）的几何信息，用于测量 gutter。 */
const inner = (row: Locator) => row.evaluate(el => [...el.children].map(col => { const r = col.firstElementChild!.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom } }))
const near = (actual: number, expected: number, tolerance = 0.6) => expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThan(tolerance)
/** 按视觉位置从左到右读取列文字。 */
const visualOrder = async (row: Locator) => (await layout(row)).cols.slice().sort((a, b) => a.x - b.x).map(col => col.text)
/** 示例里与 Divider 标题并列的 Row（排除 role=separator 的分割线）。 */
const rowsIn = (area: Locator, root: string) => area.locator(`${root} > div:not([role="separator"])`)

// 24 栅格：四行分别 1/2/3/4 等分，列宽等于行宽 × span/24，且同一行首尾相接。
test('[grid.browser.span] columns take span/24 of the row', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const rows = area.locator('[data-grid-basic] > div')
  await expect(rows).toHaveCount(4)
  for (const [index, count] of [1, 2, 3, 4].entries()) {
    const { row, cols } = await layout(rows.nth(index))
    expect(cols).toHaveLength(count)
    for (const [i, col] of cols.entries()) { near(col.w, row.w / count); near(col.x, row.x + i * row.w / count); near(col.y, row.y) }
  }
  await area.screenshot({ path: info.outputPath('basic.png') })
})

// 水平间距 16：行两侧 -8px 外边距，列左右 8px 内边距，色块之间正好 16px；[16, 24] 另有 24px 行距。
test('[grid.browser.gutter] horizontal and vertical gutter geometry', async ({ page }, info) => {
  const area = await demo(page, info, 'gutter')
  const horizontal = area.locator('[data-gutter="horizontal"]')
  await expect(horizontal).toHaveCSS('margin-left', '-8px')
  await expect(horizontal).toHaveCSS('margin-right', '-8px')
  await expect(horizontal.locator('> div').first()).toHaveCSS('padding-left', '8px')
  let boxes = await inner(horizontal)
  for (let i = 1; i < boxes.length; i++) near(boxes[i].x - boxes[i - 1].right, 16)
  // 色块的外沿与行外的容器对齐（负外边距抵消了首尾列的内边距）。
  const parent = await horizontal.evaluate(el => el.parentElement!.getBoundingClientRect().x)
  near(boxes[0].x, parent)
  const both = area.locator('[data-gutter="both"]')
  await expect(both).toHaveCSS('row-gap', '24px')
  boxes = await inner(both)
  near(boxes[4].y - boxes[0].bottom, 24)
  for (let i = 1; i < 4; i++) near(boxes[i].x - boxes[i - 1].right, 16)
  await area.screenshot({ path: info.outputPath('gutter.png') })
})

// 响应式间距随视口宽度切换：xs 8 / sm 16 / md 24 / lg 32，改变视口后实时更新。
test('[grid.browser.gutter.responsive] responsive gutter follows the viewport', async ({ page }, info) => {
  const area = await demo(page, info, 'gutter')
  const row = area.locator('[data-gutter="responsive"]')
  for (const [width, gutter] of [[1280, 32], [900, 24], [700, 16], [420, 8], [1100, 32]] as const) {
    await page.setViewportSize({ width, height: 800 })
    await expect(row, `viewport ${width}`).toHaveCSS('margin-left', `-${gutter / 2}px`)
    const boxes = await inner(row)
    for (let i = 1; i < boxes.length; i++) near(boxes[i].x - boxes[i - 1].right, gutter)
  }
})

// offset 以格为单位推开列；push/pull 交换视觉位置但 DOM 顺序不变。
test('[grid.browser.offset] offset push and pull positions', async ({ page }, info) => {
  let area = await demo(page, info, 'offset')
  const rows = area.locator('[data-grid-offset] > div')
  let { row, cols } = await layout(rows.nth(0))
  near(cols[1].x, row.x + row.w * 16 / 24)
  ;({ row, cols } = await layout(rows.nth(1)))
  near(cols[0].x, row.x + row.w * 6 / 24); near(cols[1].x, row.x + row.w * 18 / 24)
  ;({ row, cols } = await layout(rows.nth(2)))
  near(cols[0].x, row.x + row.w * 6 / 24); near(cols[0].w, row.w / 2)
  area = await demo(page, info, 'sort')
  ;({ row, cols } = await layout(area.locator('[data-grid-sort]')))
  near(cols[0].x, row.x + row.w * 6 / 24)
  near(cols[1].x, row.x)
  expect(cols.map(col => col.text)).toEqual(['col-18 push-6', 'col-6 pull-18'])
})

// justify 六种取值在真实布局中的主轴位置；align 四种取值的交叉轴位置。
test('[grid.browser.justify-align] justify and align geometry', async ({ page }, info) => {
  let area = await demo(page, info, 'flex')
  const justified = area.locator('[data-grid-justify]')
  const read = () => layout(justified)
  let { row, cols } = await read()
  near(cols[0].x, row.x)
  await area.getByRole('radio', { name: 'center', exact: true }).click()
  ;({ row, cols } = await read())
  near(cols[0].x - row.x, row.right - cols[3].right)
  await area.getByRole('radio', { name: 'end', exact: true }).click()
  ;({ row, cols } = await read())
  near(cols[3].right, row.right)
  await area.getByRole('radio', { name: 'space-between' }).click()
  ;({ row, cols } = await read())
  near(cols[0].x, row.x); near(cols[3].right, row.right)
  await area.getByRole('radio', { name: 'space-evenly' }).click()
  ;({ row, cols } = await read())
  const gaps = [cols[0].x - row.x, ...cols.slice(1).map((col, i) => col.x - cols[i].right), row.right - cols[3].right]
  for (const gap of gaps) near(gap, gaps[0], 1)
  await area.getByRole('radio', { name: 'space-around' }).click()
  ;({ row, cols } = await read())
  near(cols[1].x - cols[0].right, 2 * (cols[0].x - row.x), 1)

  area = await demo(page, info, 'align')
  const aligned = area.locator('[data-grid-align]')
  ;({ row, cols } = await layout(aligned))
  for (const col of cols) near(col.y, row.y)
  await area.getByRole('radio', { name: 'middle' }).click()
  ;({ row, cols } = await layout(aligned))
  for (const col of cols) near(col.y + col.h / 2, row.y + row.h / 2, 1)
  await area.getByRole('radio', { name: 'bottom' }).click()
  ;({ row, cols } = await layout(aligned))
  for (const col of cols) near(col.bottom, row.bottom)
  // stretch：同一行的列等高（撑满行高）。
  await area.getByRole('radio', { name: 'stretch' }).click()
  await expect(aligned).toHaveCSS('align-items', 'stretch')
  ;({ row, cols } = await layout(aligned))
  for (const col of cols) { near(col.y, row.y); near(col.h, row.h) }
  await area.screenshot({ path: info.outputPath('align.png') })
})

// 固定 order 反转视觉顺序；断点对象里的 order 随视口切换。
test('[grid.browser.order] static and responsive order', async ({ page }, info) => {
  const area = await demo(page, info, 'order')
  const rows = rowsIn(area, '[data-grid-order]')
  expect(await visualOrder(rows.first())).toEqual(['4 col-order-1', '3 col-order-2', '2 col-order-3', '1 col-order-4'])
  const responsive = area.locator('[data-order="responsive"]')
  for (const [width, order] of [
    [420, ['1 col', '2 col', '3 col', '4 col']],
    [640, ['2 col', '1 col', '4 col', '3 col']],
    [800, ['4 col', '3 col', '1 col', '2 col']],
    [1100, ['3 col', '4 col', '2 col', '1 col']],
  ] as const) {
    await page.setViewportSize({ width, height: 800 })
    await expect.poll(() => visualOrder(responsive), { message: `viewport ${width}` }).toEqual(order)
  }
})

// flex：数字 n 与 antd 一致解析为 `n n auto`——先按内容宽度，再按 2:3 分配剩余空间；
// 100px + auto 填满；简写原样生效；wrap=false 时长内容不撑破行宽。
test('[grid.browser.flex] flex columns share the row', async ({ page }, info) => {
  const area = await demo(page, info, 'flex-stretch')
  const ratio = area.locator('[data-flex="ratio"]')
  await expect(ratio.locator('> div').nth(0)).toHaveCSS('flex', '2 2 auto')
  await expect(ratio.locator('> div').nth(1)).toHaveCSS('flex', '3 3 auto')
  let { row, cols } = await layout(ratio)
  near(cols[0].w + cols[1].w, row.w)
  // 各列减去内容自身宽度（flex-basis:auto 的基准）后，剩余部分正好 2:3。
  const basis = await ratio.evaluate(el => [...el.children].map(col => {
    const range = document.createRange(); range.selectNodeContents(col)
    const s = getComputedStyle(col)
    return range.getBoundingClientRect().width + parseFloat(s.paddingLeft) + parseFloat(s.paddingRight)
  }))
  near((cols[0].w - basis[0]) / (cols[1].w - basis[1]), 2 / 3, 0.01)
  ;({ row, cols } = await layout(area.locator('[data-flex="fill"]')))
  await expect(area.locator('[data-flex="fill"] > div').first()).toHaveCSS('flex', '0 0 100px')
  near(cols[0].w, 100); near(cols[1].w, row.w - 100)
  const shorthand = area.locator('[data-flex="shorthand"] > div')
  await expect(shorthand.nth(0)).toHaveCSS('flex', '1 1 200px')
  await expect(shorthand.nth(1)).toHaveCSS('flex', '0 1 300px')
  const nowrap = area.locator('[data-flex="nowrap"]')
  ;({ row, cols } = await layout(nowrap))
  near(cols[1].right, row.right)
  near(cols[0].y, cols[1].y)
  await expect(nowrap.locator('> div').nth(1)).toHaveCSS('min-width', '0px')
  expect(await nowrap.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0)
  await area.screenshot({ path: info.outputPath('flex.png') })
})

// 断点层叠：xs 2/20/2、sm 4/16/4、md 6/12/6、lg 8/8/8、xl 10/4/10；1300px 下 xl 覆盖 sm/md/lg。
test('[grid.browser.responsive] breakpoint cascade picks the widest matching layer', async ({ page }, info) => {
  const area = await demo(page, info, 'responsive')
  const row = area.locator('[data-grid-responsive]')
  for (const [width, spans] of [
    [420, [2, 20, 2]], [600, [4, 16, 4]], [800, [6, 12, 6]], [1000, [8, 8, 8]], [1300, [10, 4, 10]], [1700, [10, 4, 10]],
  ] as const) {
    await page.setViewportSize({ width, height: 800 })
    await expect.poll(async () => {
      const { row: box, cols } = await layout(row)
      return cols.map(col => Math.round(col.w / box.w * 24))
    }, { message: `viewport ${width}` }).toEqual(spans)
  }
  await area.screenshot({ path: info.outputPath('responsive-xl.png') })
})

// span 0 在该断点隐藏、更宽断点可以恢复；Row 的响应式 justify 随视口切换。
test('[grid.browser.responsive.more] responsive hide/reveal and justify', async ({ page }, info) => {
  const area = await demo(page, info, 'responsive-more')
  const hide = area.locator('[data-responsive-hide] > div')
  const justify = area.locator('[data-responsive-justify]')
  await page.setViewportSize({ width: 420, height: 800 })
  await expect(hide.nth(0)).toBeVisible()
  await expect(hide.nth(1)).toBeHidden()
  await expect(justify).toHaveCSS('justify-content', 'center')
  await page.setViewportSize({ width: 640, height: 800 })
  await expect(justify).toHaveCSS('justify-content', 'flex-end')
  await page.setViewportSize({ width: 1000, height: 800 })
  await expect(hide.nth(0)).toBeHidden()
  await expect(hide.nth(1)).toBeVisible()
  await expect(hide.nth(1)).toHaveCSS('display', 'block')
  await expect(justify).toHaveCSS('justify-content', 'space-between')
  // 断点对象 { span, offset }：lg 下 span 6 + offset 2。
  const { row, cols } = await layout(rowsIn(area, '[data-grid-responsive-more]').first())
  near(cols[0].w, row.w * 6 / 24); near(cols[0].x, row.x + row.w * 2 / 24)
})

// useBreakpoint 返回命中断点，并随视口变化实时更新。
test('[grid.browser.useBreakpoint] reports matching screens', async ({ page }, info) => {
  const area = await demo(page, info, 'use-breakpoint')
  const screens = () => area.locator('[data-grid-screens] > *').evaluateAll(els => els.map(el => (el.textContent ?? '').trim()))
  for (const [width, expected] of [
    [1280, ['sm', 'md', 'lg', 'xl']], [700, ['sm']], [420, ['xs']], [2000, ['sm', 'md', 'lg', 'xl', 'xxl', 'xxxl']],
  ] as const) {
    await page.setViewportSize({ width, height: 800 })
    await expect.poll(screens, { message: `viewport ${width}` }).toEqual(expected)
  }
})

// 配置器：键盘拖动滑块后 gutter 与列数同步变化。
test('[grid.browser.playground] sliders drive gutter and column count', async ({ page }, info) => {
  const area = await demo(page, info, 'playground')
  const row = area.locator('[data-grid-playground]')
  await expect(row).toHaveCSS('margin-left', '-8px')
  await expect(row).toHaveCSS('row-gap', '16px')
  await expect(row.locator('> div')).toHaveCount(8)
  await area.getByRole('slider', { name: '水平间距' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(row).toHaveCSS('margin-left', '-12px')
  await area.getByRole('slider', { name: '垂直间距' }).focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await expect(row).toHaveCSS('row-gap', '32px')
  await area.getByRole('slider', { name: '列数' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(row.locator('> div')).toHaveCount(12)
  const { row: box, cols } = await layout(row)
  // 6 列一行：每列宽 = (行宽) / 6，含 24px 间距的内边距。
  near(cols[0].w, box.w / 6)
  near(cols[6].y - cols[0].bottom, 32)
  await expect(area.locator('pre')).toContainText('<Row gutter={[24, 32]}>')
  await area.screenshot({ path: info.outputPath('playground.png') })
})

// 手机宽度：负外边距不引起页面横向滚动，Segmented 在示例内可横向滚动。
test('[grid.browser.mobile] no horizontal overflow on phones', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const area = await demo(page, info, 'gutter')
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)
  const docs = info.project.name === 'docs'
  const groups = await page.locator(`${docs ? '[data-demo^="grid/"]' : '[data-grid-demo]'} [role="radiogroup"]`).all()
  // flex / align 两组。
  expect(groups).toHaveLength(2)
  for (const group of groups) {
    const clipped = await group.evaluate((el, root) => {
      const scroller = el.parentElement!
      if (getComputedStyle(scroller).overflowX !== 'auto') return true
      const box = scroller.getBoundingClientRect(), demoBox = el.closest(root)!.getBoundingClientRect()
      return box.left < demoBox.left - 0.5 || box.right > demoBox.right + 0.5
    }, docs ? '[data-demo]' : '[data-grid-demo]')
    expect(clipped, await group.getAttribute('aria-label') ?? '').toBe(false)
  }
  await area.screenshot({ path: info.outputPath('mobile.png') })
})

// 开发模式（未经构建）同样生成列变量类与媒体查询。
test('[grid.browser.dev] development styles resolve', async ({ page }) => {
  await page.setViewportSize({ width: 1300, height: 800 })
  await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE ?? '/'}${path}`)
  const row = page.locator('[data-demo="grid/responsive"] [data-grid-responsive]')
  await expect.poll(async () => {
    const { row: box, cols } = await layout(row)
    return cols.map(col => Math.round(col.w / box.w * 24))
  }).toEqual([10, 4, 10])
  await expect(page.locator('[data-demo="grid/gutter"] [data-gutter="responsive"]')).toHaveCSS('margin-left', '-16px')
})

// 原始静态 HTML 含 API、注意事项与示例源码（文档站示例本身在客户端渲染，静态 HTML 只断言文字与源码）。
test('[grid.browser.ssr] API contracts and source', async ({ request }) => {
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  for (const text of ['ColSize（断点对象）', 'useBreakpoint', 'Col 不再默认 24 格', 'grid/playground', 'xxxl', 'data-grid-responsive']) expect(html).toContain(text)
})
