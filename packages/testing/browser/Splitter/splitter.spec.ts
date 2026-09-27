import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'

const path = 'components/layout/splitter/'
async function demo(page: Page, info: TestInfo, id: string) {
  await page.goto(info.project.name === 'docs' ? path : 'Splitter')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="splitter/${id}"]` : `[data-splitter-demo="${id}"]`)
  await expect(area.locator('.upthrust-splitter').first()).toBeAttached()
  return area
}
type Rect = { x: number; y: number; w: number; h: number; right: number; bottom: number }
/** DOMRect 的字段是原型上的 getter，跨进程序列化会丢失，必须先拷成普通对象。 */
const rect = (target: Locator) => target.evaluate((el): Rect => {
  const r = el.getBoundingClientRect()
  return { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom }
})
const near = (actual: number, expected: number, tolerance = 1) => expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThan(tolerance)
const nearAll = (actual: number[], expected: number[], tolerance = 1) => {
  expect(actual).toHaveLength(expected.length)
  actual.forEach((value, i) => near(value, expected[i], tolerance))
}
const panels = (splitter: Locator) => splitter.locator(':scope > .upthrust-splitter-panel')
const bars = (splitter: Locator) => splitter.locator(':scope > .upthrust-splitter-bar')
const draggers = (splitter: Locator) => bars(splitter).locator(':scope > [role="separator"]')
/** 各面板在主轴上的尺寸（px）。 */
const sizes = (splitter: Locator, axis: 'x' | 'y' = 'x') => panels(splitter).evaluateAll(
  (els, vertical) => els.map(el => (vertical ? el.getBoundingClientRect().height : el.getBoundingClientRect().width)),
  axis === 'y',
)
/** 容器内容区尺寸（示例外框有 1px 边框）。 */
const inner = (splitter: Locator, axis: 'x' | 'y' = 'x') => splitter.evaluate((el, vertical) => (vertical ? el.clientHeight : el.clientWidth), axis === 'y')
/** 过渡中的尺寸需轮询到目标值。 */
const expectSizes = (splitter: Locator, expected: number[], axis: 'x' | 'y' = 'x') =>
  expect.poll(async () => (await sizes(splitter, axis)).map(Math.round)).toEqual(expected.map(Math.round))
const center = async (target: Locator) => {
  const box = await rect(target)
  return { x: box.x + box.w / 2, y: box.y + box.h / 2 }
}
/** 组件把间隔小于 300ms 的两次按下视为双击（不开始拖拽），连续拖拽之间按真实用户节奏留出间隔。 */
const DOUBLE_CLICK_GAP = 300
/** 真实鼠标拖拽：先滚动到可见（page.mouse 不会自动滚动），按下后分多步移动；hold 时不松开，由调用方继续断言。 */
async function drag(page: Page, dragger: Locator, dx: number, dy: number, hold = false) {
  await dragger.scrollIntoViewIfNeeded()
  await page.waitForTimeout(DOUBLE_CLICK_GAP + 50)
  const start = await center(dragger)
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await page.mouse.move(start.x + dx, start.y + dy, { steps: 8 })
  if (!hold) await page.mouse.up()
}
const opacity = (target: Locator) => target.evaluate(el => Number(getComputedStyle(el).opacity))
const translate = (target: Locator) => target.evaluate(el => {
  const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform)
  return { x: matrix.m41, y: matrix.m42 }
})
const noPageOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
/** 从文本中取出所有数字（回调上报的尺寸按整数显示，容器宽度可能带小数，按 1px 容差比较）。 */
const numbersIn = (text: string) => [...text.matchAll(/\d+(\.\d+)?/g)].map(match => Number(match[0]))

// 基本布局：40% / 60% 且之和等于容器；分隔条本身零宽，拖拽热区 6px、满高且居中；aria 为百分比。
test('[splitter.browser.structure] initial sizes, zero-width bar and aria', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const splitter = area.locator('.upthrust-splitter')
  const width = await inner(splitter)
  nearAll(await sizes(splitter), [width * 0.4, width * 0.6])
  const [bar, dragger] = [bars(splitter).first(), draggers(splitter).first()]
  expect((await rect(bar)).w).toBe(0)
  const [barBox, draggerBox, splitterBox] = await Promise.all([rect(bar), rect(dragger), rect(splitter)])
  near(draggerBox.w, 6, 0.1)
  near(draggerBox.h, splitterBox.h - 2)
  near(draggerBox.x + draggerBox.w / 2, barBox.x, 0.6)
  await expect(dragger).toHaveCSS('cursor', 'col-resize')
  await expect(dragger).toHaveAttribute('aria-orientation', 'vertical')
  await expect(dragger).toHaveAttribute('aria-valuenow', '40')
  await expect(dragger).toHaveAttribute('aria-valuemin', '20')
  await expect(dragger).toHaveAttribute('aria-valuemax', '70')
  await area.screenshot({ path: info.outputPath('basic.png') })
})

// 真实拖拽：跟手移动；拖拽中出现全视口遮罩与调整光标；超出 min / max 时被夹取；松开后遮罩移除。
test('[splitter.browser.drag] pointer drag with mask and limits', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const splitter = area.locator('.upthrust-splitter')
  const dragger = draggers(splitter).first()
  const width = await inner(splitter)
  await drag(page, dragger, 50, 0, true)
  nearAll(await sizes(splitter), [width * 0.4 + 50, width * 0.6 - 50])
  const mask = page.locator('.upthrust-splitter-mask')
  await expect(mask).toHaveCount(1)
  await expect(mask).toHaveCSS('position', 'fixed')
  await expect(mask).toHaveCSS('cursor', 'col-resize')
  near((await rect(mask)).w, await page.evaluate(() => innerWidth), 1)
  await expect(dragger).toHaveCSS('z-index', '2')
  await page.mouse.up()
  await expect(mask).toHaveCount(0)

  await drag(page, dragger, 2000, 0)
  nearAll(await sizes(splitter), [width * 0.7, width * 0.3])
  await expect(dragger).toHaveAttribute('aria-valuenow', '70')
  await drag(page, dragger, -2000, 0)
  nearAll(await sizes(splitter), [width * 0.2, width * 0.8])
  await expect(dragger).toHaveAttribute('aria-valuenow', '20')
})

// 键盘：聚焦分隔条后方向键每次 16px；Home / End 推到 min / max。
test('[splitter.browser.keyboard] arrow keys, Home and End', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const splitter = area.locator('.upthrust-splitter')
  const dragger = draggers(splitter).first()
  const width = await inner(splitter)
  await dragger.focus()
  await expect(dragger).toBeFocused()
  await page.keyboard.press('ArrowRight')
  nearAll(await sizes(splitter), [width * 0.4 + 16, width * 0.6 - 16])
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  nearAll(await sizes(splitter), [width * 0.4 - 16, width * 0.6 + 16])
  await page.keyboard.press('Home')
  nearAll(await sizes(splitter), [width * 0.2, width * 0.8])
  await page.keyboard.press('End')
  nearAll(await sizes(splitter), [width * 0.7, width * 0.3])
})

// 受控：拖拽经 onResize 写回；关闭 resizable 后分隔条不可拖拽 / 不可聚焦；重置恢复 50%。
test('[splitter.browser.control] controlled sizes and resizable switch', async ({ page }, info) => {
  const area = await demo(page, info, 'control')
  const splitter = area.locator('.upthrust-splitter')
  const dragger = draggers(splitter).first()
  const label = area.locator('[data-sizes]')
  const width = await inner(splitter)
  await expect(label).toHaveText('50% / 50%')
  await drag(page, dragger, 60, 0)
  nearAll(await sizes(splitter), [width / 2 + 60, width / 2 - 60])
  await expect(label).toHaveText(/^\d+px \/ \d+px$/)
  nearAll(numbersIn(await label.innerText()), [width / 2 + 60, width / 2 - 60], 1.5)

  await area.getByRole('switch').click()
  await expect(dragger).toHaveAttribute('aria-disabled', 'true')
  await expect(dragger).toHaveAttribute('tabindex', '-1')
  await expect(dragger).toHaveCSS('cursor', 'default')
  await drag(page, dragger, -100, 0)
  nearAll(await sizes(splitter), [width / 2 + 60, width / 2 - 60])

  await area.getByRole('switch').click()
  await area.getByRole('button', { name: '重置' }).click()
  await expect(label).toHaveText('50% / 50%')
  nearAll(await sizes(splitter), [width / 2, width / 2])
})

// 垂直方向：上下排列、平分高度；分隔条横向，行调整光标；拖拽与方向键沿纵轴生效。
test('[splitter.browser.vertical] vertical orientation', async ({ page }, info) => {
  const area = await demo(page, info, 'vertical')
  const splitter = area.locator('.upthrust-splitter')
  const dragger = draggers(splitter).first()
  const height = await inner(splitter, 'y')
  await expect(splitter).toHaveCSS('flex-direction', 'column')
  nearAll(await sizes(splitter, 'y'), [height / 2, height / 2])
  expect((await rect(bars(splitter).first())).h).toBe(0)
  near((await rect(dragger)).h, 6, 0.1)
  await expect(dragger).toHaveAttribute('aria-orientation', 'horizontal')
  await expect(dragger).toHaveCSS('cursor', 'row-resize')
  await drag(page, dragger, 0, 40)
  nearAll(await sizes(splitter, 'y'), [height / 2 + 40, height / 2 - 40])
  await dragger.focus()
  await page.keyboard.press('ArrowDown')
  nearAll(await sizes(splitter, 'y'), [height / 2 + 56, height / 2 - 56])
  await area.screenshot({ path: info.outputPath('vertical.png') })
})

// 折叠：按钮默认悬停显示、showCollapsibleIcon 常显；点击折叠到 0（忽略 min）并回调；motion 过渡 flex-basis；另一侧按钮恢复原尺寸。
test('[splitter.browser.collapse] collapse buttons, motion and restore', async ({ page }, info) => {
  const area = await demo(page, info, 'collapsible')
  const splitter = area.locator('.upthrust-splitter')
  const width = await inner(splitter)
  const third = width / 3
  nearAll(await sizes(splitter), [third, third, third])
  const [bar0, bar1] = [bars(splitter).nth(0), bars(splitter).nth(1)]
  const start = bar0.getByRole('button', { name: '切换起始侧面板' })
  const end = bar0.getByRole('button', { name: '切换末尾侧面板' })
  await expect(bar1.getByRole('button')).toHaveCount(0)
  expect(await opacity(start)).toBe(0)
  expect(await opacity(end)).toBe(1)
  near((await rect(start)).w, 12, 0.1)
  near((await rect(start)).h, 24, 0.1)
  await expect(start.locator('.i-mdi-chevron-left')).toBeAttached()
  await expect(panels(splitter).first()).toHaveCSS('transition-property', /flex-basis/)

  await draggers(splitter).first().hover()
  await expect.poll(() => opacity(start)).toBe(1)
  await start.click()
  await expectSizes(splitter, [0, third * 2, third])
  const log = area.locator('[data-log] li').first()
  await expect(log).toHaveText(/^collapsed=\[true,false,false\] sizes=\[0,\d+,\d+\]$/)
  nearAll(numbersIn((await log.innerText()).split('sizes=')[1]), [0, third * 2, third], 1.5)
  await area.screenshot({ path: info.outputPath('collapsed.png') })

  await draggers(splitter).first().hover()
  await end.click()
  await expectSizes(splitter, [third, third, third])
  await expect(area.locator('[data-log] li').first()).toHaveText(/^collapsed=\[false,false,false\]/)
})

// 自定义折叠图标：替换为使用方内容，按钮背景透明且常显。
test('[splitter.browser.collapsibleIcon] custom collapse icons', async ({ page }, info) => {
  const area = await demo(page, info, 'collapsible-icon')
  const bar = bars(area.locator('.upthrust-splitter')).first()
  const start = bar.getByRole('button', { name: '切换起始侧面板' })
  const end = bar.getByRole('button', { name: '切换末尾侧面板' })
  await expect(start).toHaveText('‹')
  await expect(end).toHaveText('›')
  await expect(start).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  expect(await opacity(start)).toBe(1)
  await expect(start.locator('[class*="i-mdi-"]')).toHaveCount(0)
  await area.screenshot({ path: info.outputPath('collapsible-icon.png') })
})

// 多面板：拖拽只在相邻两面板间转移尺寸，撞到 min=60 停止；回调上报的总和始终等于容器宽度。
test('[splitter.browser.multiple] adjacent transfer and min limits', async ({ page }, info) => {
  const area = await demo(page, info, 'multiple')
  const splitter = area.locator('.upthrust-splitter')
  const width = await inner(splitter)
  const quarter = width / 4
  nearAll(await sizes(splitter), [quarter, quarter, quarter, quarter])
  await drag(page, draggers(splitter).nth(0), -1000, 0)
  nearAll(await sizes(splitter), [60, quarter * 2 - 60, quarter, quarter])
  await drag(page, draggers(splitter).nth(2), 1000, 0)
  nearAll(await sizes(splitter), [60, quarter * 2 - 60, quarter * 2 - 60, 60])
  await expect(area.locator('[data-sizes]')).toHaveText(new RegExp(`= ${Math.round(width)}px$`))
})

// 嵌套：外层 30% / 70%；只含一个子 Splitter 的面板不滚动；内层纵向 60% / 40%。
test('[splitter.browser.nested] nested splitter fills its panel', async ({ page }, info) => {
  const area = await demo(page, info, 'nested')
  const outer = area.locator('[data-splitter-nested]')
  const width = await inner(outer)
  nearAll(await sizes(outer), [width * 0.3, width * 0.7])
  const host = panels(outer).nth(1)
  await expect(host).toHaveCSS('overflow', 'hidden')
  const nested = host.locator('.upthrust-splitter')
  const height = await inner(nested, 'y')
  near(height, await inner(outer, 'y'))
  nearAll(await sizes(nested, 'y'), [height * 0.6, height * 0.4])
  await area.screenshot({ path: info.outputPath('nested.png') })
})

// 延迟模式：拖拽中只移动预览线（按 min / max 夹取），面板不变；松开后一次性应用。横向与纵向各验一次。
test('[splitter.browser.lazy] preview line then apply on release', async ({ page }, info) => {
  const area = await demo(page, info, 'lazy')
  const [horizontal, vertical] = [area.locator('.upthrust-splitter').nth(0), area.locator('.upthrust-splitter').nth(1)]
  const width = await inner(horizontal)
  await drag(page, draggers(horizontal).first(), 80, 0, true)
  const preview = horizontal.locator('.upthrust-splitter-preview')
  await expect(preview).toBeVisible()
  near((await translate(preview)).x, 80)
  nearAll(await sizes(horizontal), [width * 0.4, width * 0.6])
  await page.mouse.move((await center(draggers(horizontal).first())).x + 2000, 0, { steps: 4 })
  near((await translate(preview)).x, width * 0.3)
  await page.mouse.up()
  await expect(preview).toHaveCount(0)
  nearAll(await sizes(horizontal), [width * 0.7, width * 0.3])

  const height = await inner(vertical, 'y')
  await drag(page, draggers(vertical).first(), 0, -2000, true)
  const verticalPreview = vertical.locator('.upthrust-splitter-preview')
  near((await translate(verticalPreview)).y, -height * 0.1)
  nearAll(await sizes(vertical, 'y'), [height * 0.4, height * 0.6])
  await page.mouse.up()
  nearAll(await sizes(vertical, 'y'), [height * 0.3, height * 0.7])
})

// 自定义样式：draggerIcon 替换默认抓手；dragger.active 的类名与内联样式只在拖拽中生效。
test('[splitter.browser.customize] dragger icon and active styles', async ({ page }, info) => {
  const area = await demo(page, info, 'customize')
  const splitter = area.locator('.upthrust-splitter')
  const dragger = draggers(splitter).first()
  const icon = dragger.locator('.upthrust-splitter-dragger-icon .i-mdi-drag-vertical')
  const box = await rect(icon)
  expect(box.w).toBeGreaterThan(8)
  expect(await dragger.evaluate(el => getComputedStyle(el, '::after').display)).toBe('none')
  await expect(panels(splitter).first()).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(dragger).toHaveCSS('box-shadow', 'none')
  const idle = await dragger.evaluate(el => getComputedStyle(el).backgroundColor)
  await drag(page, dragger, 30, 0, true)
  await expect(dragger).not.toHaveCSS('box-shadow', 'none')
  expect(await dragger.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(idle)
  await area.screenshot({ path: info.outputPath('customize-active.png') })
  await page.mouse.up()
  await expect(dragger).toHaveCSS('box-shadow', 'none')
})

// 双击：先拖动改变尺寸，再双击分隔条，两侧面板恢复初始 30% / 40%，第三个面板不受影响。
test('[splitter.browser.doubleClick] double-click resets the adjacent panels', async ({ page }, info) => {
  const area = await demo(page, info, 'double-click')
  const splitter = area.locator('.upthrust-splitter')
  const width = await inner(splitter)
  nearAll(await sizes(splitter), [width * 0.3, width * 0.4, width * 0.3])
  await drag(page, draggers(splitter).first(), 80, 0)
  nearAll(await sizes(splitter), [width * 0.3 + 80, width * 0.4 - 80, width * 0.3])
  await draggers(splitter).first().dblclick()
  nearAll(await sizes(splitter), [width * 0.3, width * 0.4, width * 0.3])
})

// 隐藏时销毁：折叠后内容卸载，展开后重新挂载（计数 +1）。
test('[splitter.browser.destroyOnHidden] unmounts collapsed content', async ({ page }, info) => {
  const area = await demo(page, info, 'destroy-on-hidden')
  const splitter = area.locator('.upthrust-splitter')
  const width = await inner(splitter)
  await expect(area.locator('[data-mounts]')).toHaveText('已挂载 1 次')
  const bar = bars(splitter).first()
  await bar.getByRole('button', { name: '切换起始侧面板' }).click()
  await expectSizes(splitter, [0, width])
  await expect(area.locator('[data-mounts]')).toHaveCount(0)
  await draggers(splitter).first().hover()
  await bar.getByRole('button', { name: '切换末尾侧面板' }).click()
  await expectSizes(splitter, [width / 2, width / 2])
  await expect(area.locator('[data-mounts]')).toHaveText('已挂载 2 次')
})

test.describe('touch', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  // 手机（无悬停能力）：页面不横向溢出；悬停模式的折叠按钮常显，点按即可折叠。
  test('[splitter.browser.mobile] phones show hover-only collapse buttons', async ({ page }, info) => {
    const area = await demo(page, info, 'collapsible')
    expect(await noPageOverflow(page)).toBeLessThanOrEqual(0)
    const splitter = area.locator('.upthrust-splitter')
    const start = bars(splitter).first().getByRole('button', { name: '切换起始侧面板' })
    expect(await opacity(start)).toBe(1)
    await start.tap()
    await expect.poll(async () => Math.round((await sizes(splitter))[0])).toBe(0)
    await area.screenshot({ path: info.outputPath('mobile.png') })
  })
})

// 开发模式（未经构建）：零宽分隔条、6px 热区、折叠图标与遮罩样式都生效。
test('[splitter.browser.dev] development styles resolve', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE ?? '/'}${path}`)
  const basic = page.locator('[data-demo="splitter/basic"] .upthrust-splitter')
  await expect(basic).toBeAttached()
  expect((await rect(bars(basic).first())).w).toBe(0)
  await expect(draggers(basic).first()).toHaveCSS('width', '6px')
  const icon = page.locator('[data-demo="splitter/collapsible"] .i-mdi-chevron-right').first()
  await expect(icon).not.toHaveCSS('mask-image', 'none')
  await drag(page, draggers(basic).first(), 20, 0, true)
  await expect(page.locator('.upthrust-splitter-mask')).toHaveCSS('position', 'fixed')
  await page.mouse.up()
})

// 原始静态 HTML 含 API、注意事项与示例源码（文档站示例本身在客户端渲染，静态 HTML 只断言文字与源码）。
test('[splitter.browser.ssr] API contracts and source', async ({ request }) => {
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  for (const text of ['onDraggerDoubleClick', 'showCollapsibleIcon', 'keyboardStep', 'destroyOnHidden', '容器尺寸变化', 'aria-valuenow', 'RTL', 'splitter/lazy', 'data-splitter-destroy']) expect(html).toContain(text)
})
