import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/layout/masonry/'
async function demo(page: Page, info: TestInfo, id: string) {
  // 关闭过渡：定位断言读取的是最终位置，而不是 0.3s 的移动过程。
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(info.project.name === 'docs' ? path : 'Masonry')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="masonry/${id}"]` : `[data-masonry-demo="${id}"]`)
  await expect(area.locator('.upthrust-masonry').first()).toBeAttached()
  return area
}

type Layout = {
  /** 各项所在列（data-column）。 */
  columns: number[]
  /** 按实测高度、以“最短列优先”（pins 固定列）推算出的列；应与 columns 一致。 */
  expected: number[]
  itemWidth: number
  /** 根节点宽度与高度。 */
  width: number
  height: number
  /** 所有几何约束的违例描述，空数组表示布局正确。 */
  errors: string[]
}
/**
 * 在页面内读取瀑布流的真实几何并校验：
 * - 所有项已定位（absolute + data-column）；
 * - 同宽，宽度 = (容器 + 水平间距) / 列数 − 水平间距，left = 列号 × (宽度 + 水平间距)；
 * - 每列自上而下紧密排布：首项 top 为 0，其后 top = 上一项 bottom + 垂直间距；
 * - 根节点高度 = 最高列；
 * - 列分配与“最短列优先（相同取靠前）”的推算一致（sequential 时跳过）。
 */
const readLayout = (root: Locator, count: number, gutter: [number, number], pins: (number | undefined)[] = [], sequential = false) =>
  root.evaluate((el, [count, [gh, gv], pins, sequential]): Layout => {
    const errors: string[] = []
    const origin = el.getBoundingClientRect()
    const items = [...el.children] as HTMLElement[]
    const columns = items.map(item => Number(item.dataset.column))
    const boxes = items.map(item => {
      const r = item.getBoundingClientRect()
      return { left: r.left - origin.left, top: r.top - origin.top, width: r.width, height: r.height }
    })
    const width = el.clientWidth
    const itemWidth = (width + gh) / count - gh
    const near = (a: number, b: number) => Math.abs(a - b) < 0.6
    items.forEach((item, i) => {
      if (getComputedStyle(item).position !== 'absolute' || Number.isNaN(columns[i])) errors.push(`item ${i} not placed`)
      if (!near(boxes[i].width, itemWidth)) errors.push(`item ${i} width ${boxes[i].width} ≠ ${itemWidth}`)
      if (!near(boxes[i].left, columns[i] * (itemWidth + gh))) errors.push(`item ${i} left ${boxes[i].left}`)
    })
    const bottoms = Array.from({ length: count }, () => 0)
    const expected: number[] = []
    const heights = Array.from({ length: count }, () => 0)
    for (let column = 0; column < count; column++) {
      const stack = boxes.map((box, i) => ({ ...box, i })).filter(box => columns[box.i] === column).sort((a, b) => a.top - b.top)
      let next = 0
      for (const box of stack) {
        if (!near(box.top, next)) errors.push(`item ${box.i} top ${box.top} ≠ ${next}`)
        next = box.top + box.height + gv
        bottoms[column] = box.top + box.height
      }
    }
    if (!near(el.getBoundingClientRect().height, Math.max(0, ...bottoms))) errors.push(`root height ${el.getBoundingClientRect().height}`)
    boxes.forEach((box, i) => {
      const pinned = pins[i]
      const column = pinned !== undefined && pinned !== null
        ? Math.min(pinned, count - 1)
        : heights.indexOf(Math.min(...heights))
      expected.push(column)
      heights[column] += box.height + gv
    })
    if (!sequential && expected.join() !== columns.join()) errors.push(`columns ${columns} ≠ shortest-first ${expected}`)
    return { columns, expected, itemWidth, width, height: el.getBoundingClientRect().height, errors }
  }, [count, gutter, pins, sequential] as const)
/** 测量在 rAF 中异步完成，轮询到布局无违例。 */
const expectLayout = async (root: Locator, count: number, gutter: [number, number], pins: (number | undefined)[] = [], sequential = false) => {
  await expect.poll(async () => (await readLayout(root, count, gutter, pins, sequential)).errors).toEqual([])
  return readLayout(root, count, gutter, pins, sequential)
}
const items = (root: Locator) => root.locator(':scope > .upthrust-masonry-item')
const noPageOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

// 基本：15 项、4 列、16px 间距；测量后绝对定位，宽度 / left / top / 根高度与“最短列优先”的推算完全一致。
test('[masonry.browser.basic] shortest-column layout with real geometry', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const root = area.locator('.upthrust-masonry')
  await expect(items(root)).toHaveCount(15)
  const layout = await expectLayout(root, 4, [16, 16])
  expect(new Set(layout.columns)).toEqual(new Set([0, 1, 2, 3]))
  await expect(root).toHaveCSS('position', 'relative')
  await expect(root).not.toHaveCSS('display', 'grid')
  await area.screenshot({ path: info.outputPath('basic.png') })
})

// 响应式：视口 ≥lg 时 4 列、间距 16 / 24；sm 时 2 列、垂直未命中沿用水平 12；xs 时 1 列、8 / 8；切换视口实时重排。
test('[masonry.browser.responsive] columns and gutters follow the viewport', async ({ page }, info) => {
  await page.setViewportSize({ width: 1300, height: 900 })
  const area = await demo(page, info, 'responsive')
  const root = area.locator('.upthrust-masonry')
  await expectLayout(root, 4, [16, 24])
  await area.screenshot({ path: info.outputPath('responsive-lg.png') })
  await page.setViewportSize({ width: 700, height: 900 })
  await expectLayout(root, 2, [12, 12])
  await page.setViewportSize({ width: 420, height: 900 })
  const single = await expectLayout(root, 1, [8, 8])
  expect(new Set(single.columns)).toEqual(new Set([0]))
  await page.setViewportSize({ width: 1300, height: 900 })
  await expectLayout(root, 4, [16, 24])
})

// 图片：data URI 图片加载后按真实比例撑高，重新排布后无重叠；每项高度 = 宽度 × 图片宽高比。
test('[masonry.browser.image] re-lays out after images load', async ({ page }, info) => {
  await page.setViewportSize({ width: 1300, height: 900 })
  const area = await demo(page, info, 'image')
  const root = area.locator('.upthrust-masonry')
  await expect.poll(() => root.locator('img').evaluateAll(imgs => imgs.every(img => (img as HTMLImageElement).complete))).toBe(true)
  const layout = await expectLayout(root, 4, [12, 12])
  const ratios = await root.locator('img').evaluateAll(imgs => imgs.map(img => {
    const image = img as HTMLImageElement
    return image.getBoundingClientRect().height / image.getBoundingClientRect().width - image.naturalHeight / image.naturalWidth
  }))
  ratios.forEach(diff => expect(Math.abs(diff)).toBeLessThan(0.01))
  // 8 张图分 4 列、每列 2 张且高宽比都 ≥ 0.6：根高度必然超过单项宽度（图片未加载时高度为 0）。
  expect(layout.height).toBeGreaterThan(layout.itemWidth)
  await area.screenshot({ path: info.outputPath('image.png') })
})

// 动态增删：新增项测量前透明、定位后不透明；删除后剩余项重新紧密排布；key 稳定时已有项 DOM 不重建。
test('[masonry.browser.dynamic] add and remove items', async ({ page }, info) => {
  const area = await demo(page, info, 'dynamic')
  const root = area.locator('.upthrust-masonry')
  await expectLayout(root, 4, [16, 16])
  await items(root).nth(0).evaluate(el => { (el as HTMLElement & { marker?: string }).marker = '#0' })
  await items(root).nth(1).evaluate(el => { (el as HTMLElement & { marker?: string }).marker = '#1' })
  await area.getByRole('button', { name: '添加一项' }).click()
  await area.getByRole('button', { name: '添加一项' }).click()
  await expect(items(root)).toHaveCount(8)
  await expectLayout(root, 4, [16, 16])
  await expect(items(root).last()).toHaveCSS('opacity', '1')
  await expect(items(root).last()).toContainText('#7')
  await area.getByRole('button', { name: '删除 #0' }).click()
  await expect(items(root)).toHaveCount(7)
  await expect(root).not.toContainText('#0')
  await expectLayout(root, 4, [16, 16])
  // 删除 #0 后，#1 成为首项且仍是原来的节点（按 key 复用，没有整体重建）。
  expect(await items(root).first().evaluate(el => (el as HTMLElement & { marker?: string }).marker)).toBe('#1')
  await area.screenshot({ path: info.outputPath('dynamic.png') })
})

// fresh：展开一张卡片后它变高，同列后续项下移、根高度增加；收起后恢复。
test('[masonry.browser.fresh] item resize re-lays out', async ({ page }, info) => {
  const area = await demo(page, info, 'fresh')
  const root = area.locator('.upthrust-masonry')
  const before = await expectLayout(root, 3, [12, 12])
  const card = area.getByRole('button').first()
  await card.click()
  await expect(card).toHaveAttribute('aria-expanded', 'true')
  const after = await expectLayout(root, 3, [12, 12])
  expect(after.height).toBeGreaterThan(before.height)
  await area.screenshot({ path: info.outputPath('fresh.png') })
  await card.click()
  await expect.poll(async () => (await readLayout(root, 3, [12, 12])).height).toBeCloseTo(before.height, 0)
  expect((await readLayout(root, 3, [12, 12])).errors).toEqual([])
})

// itemRender 的 column：第一项固定在第 3 列；每张卡片显示的列号与实际所在列一致。
test('[masonry.browser.itemRender] pinned column and reactive column info', async ({ page }, info) => {
  const area = await demo(page, info, 'item-render')
  const root = area.locator('.upthrust-masonry')
  const layout = await expectLayout(root, 3, [12, 12], [2])
  expect(layout.columns[0]).toBe(2)
  await expect(items(root).first()).toContainText('第 3 列（固定）')
  const texts = await items(root).allTextContents()
  texts.forEach((text, i) => expect(text).toContain(`第 ${layout.columns[i] + 1} 列`))
})

// onLayoutChange：外部列表按列汇总的 key 与实际所在列一致。
test('[masonry.browser.layoutChange] reported columns match the DOM', async ({ page }, info) => {
  const area = await demo(page, info, 'layout-change')
  const root = area.locator('.upthrust-masonry')
  const layout = await expectLayout(root, 3, [8, 8])
  const keys = await items(root).allTextContents()
  const expected = [0, 1, 2].map(column => `第 ${column + 1} 列：${keys.filter((_, i) => layout.columns[i] === column).join(' ')}`)
  await expect(area.locator('[data-layout] li')).toHaveText(expected)
})

// sequential：12 项 5 列按阅读顺序分为 3、3、2、2、2；默认模式按最短列放置。
test('[masonry.browser.sequential] reading-order distribution', async ({ page }, info) => {
  await page.setViewportSize({ width: 1300, height: 900 })
  const area = await demo(page, info, 'sequential')
  const [shortest, sequential] = [area.locator('.upthrust-masonry').nth(0), area.locator('.upthrust-masonry').nth(1)]
  await expectLayout(shortest, 5, [8, 8])
  const layout = await expectLayout(sequential, 5, [8, 8], [], true)
  expect(layout.columns).toEqual([0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4])
})

// children 写法：5 个子节点各为一项，gutter="small" 为 8px。
test('[masonry.browser.children] plain children with a named gutter', async ({ page }, info) => {
  const area = await demo(page, info, 'children')
  const root = area.locator('.upthrust-masonry')
  await expect(items(root)).toHaveCount(5)
  await expectLayout(root, 3, [8, 8])
})

// 手机宽度：固定 4 列的示例仍然 4 列、页面不横向溢出；响应式示例为 1 列。
test('[masonry.browser.mobile] phones keep layouts inside the page', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const area = await demo(page, info, 'basic')
  await expectLayout(area.locator('.upthrust-masonry'), 4, [16, 16])
  expect(await noPageOverflow(page)).toBeLessThanOrEqual(0)
  await expectLayout(page.locator('[data-demo="masonry/responsive"] .upthrust-masonry'), 1, [8, 8])
  await area.screenshot({ path: info.outputPath('mobile.png') })
})

// 开发模式（未经构建）：CSS 变量计算的宽度与 left 同样生效。
test('[masonry.browser.dev] development styles resolve', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE ?? '/'}${path}`)
  const root = page.locator('[data-demo="masonry/basic"] .upthrust-masonry')
  await expect(root).toBeAttached()
  await expectLayout(root, 4, [16, 16])
})

// 原始静态 HTML 含 API、注意事项与示例源码（文档站示例本身在客户端渲染，静态 HTML 只断言文字与源码）。
test('[masonry.browser.ssr] API contracts and source', async ({ request }) => {
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  for (const text of ['onLayoutChange', 'sequential', 'fresh', 'itemRender', '再退回 1', '离场动画', 'masonry/image', 'data-masonry-dynamic']) expect(html).toContain(text)
})
