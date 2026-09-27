import { test, expect, type Page, type TestInfo } from '@playwright/test'

const path = 'components/layout/flex/'
async function demo(page: Page, info: TestInfo, id: string) {
  await page.goto(info.project.name === 'docs' ? path : 'Flex')
  const area = page.locator(info.project.name === 'docs' ? `[data-demo="flex/${id}"]` : `[data-flex-demo="${id}"]`)
  await expect(area.locator('[class*="flex"]').first()).toBeVisible()
  return area
}

// flex={1} 的内容区占满侧栏之外的剩余宽度；字符串 flex 原样生效。
test('[flex.browser.flex-item] flex fills remaining space', async ({ page }, info) => {
  const area = await demo(page, info, 'flex-item')
  const outer = area.locator('[data-flex-item]'), fill = area.locator('[data-flex-fill]')
  const [outerBox, fillBox] = await Promise.all([outer.boundingBox(), fill.boundingBox()])
  expect(Math.abs(fillBox!.width - (outerBox!.width - 2 - 120))).toBeLessThan(0.6)
  await expect(fill).toHaveCSS('flex-grow', '1')
  await expect(fill).toHaveCSS('flex-basis', '0%')
  const none = area.getByText('flex="none"')
  await expect(none).toHaveCSS('flex-grow', '0')
  await expect(none).toHaveCSS('flex-shrink', '0')
  await area.screenshot({ path: info.outputPath('flex-item.png') })
})

// component 渲染语义元素；原生属性、事件与 ref 到达宿主；自定义组件收到计算后的布局样式。
test('[flex.browser.element] semantic host attributes events and ref', async ({ page }, info) => {
  const area = await demo(page, info, 'element')
  const list = area.locator('[data-flex-list]')
  expect(await list.evaluate(el => el.tagName)).toBe('UL')
  await expect(list.locator(':scope > li')).toHaveCount(4)
  await expect(list).toHaveCSS('column-gap', '8px')
  const toolbar = area.getByRole('toolbar', { name: '批量操作' })
  expect(await toolbar.evaluate(el => el.tagName)).toBe('NAV')
  await expect(toolbar).toHaveAttribute('tabindex', '0')
  const width = Math.round((await toolbar.boundingBox())!.width)
  await expect(toolbar.locator('output')).toHaveText(`点击 0 次 · 宽 ${width}px`)
  await toolbar.click()
  await toolbar.locator('span').first().click()
  await expect(toolbar.locator('output')).toHaveText(`点击 2 次 · 宽 ${width}px`)
  const custom = area.getByRole('region', { name: '自定义组件容器' })
  expect(await custom.evaluate(el => el.tagName)).toBe('SECTION')
  await expect(custom).toHaveAttribute('data-flex-custom', '')
  await expect(custom).toHaveCSS('display', 'flex')
  await expect(custom).toHaveCSS('justify-content', 'space-between')
  await expect(custom).toHaveCSS('column-gap', '12px')
  await expect(custom).toHaveCSS('border-top-style', 'dashed')
  await area.screenshot({ path: info.outputPath('element.png') })
})

// inline 容器与文字同处一行；空容器 display:none，填充后出现，清空后再次隐藏。
test('[flex.browser.inline-empty] inline-flex line and empty hiding', async ({ page }, info) => {
  const area = await demo(page, info, 'inline-empty')
  const inline = area.locator('[data-flex-inline]')
  await expect(inline).toHaveCSS('display', 'inline-flex')
  // 前导文字“订单状态”与 inline 容器处在同一行：垂直范围重叠，且容器紧随文字之后。
  const line = await inline.evaluate(el => {
    const range = document.createRange(); range.selectNodeContents(el.previousSibling!)
    const text = range.getBoundingClientRect(), box = el.getBoundingClientRect()
    return { overlap: Math.min(text.bottom, box.bottom) - Math.max(text.top, box.top), textRight: text.right, boxLeft: box.left }
  })
  expect(line.overlap).toBeGreaterThan(10)
  expect(line.boxLeft).toBeGreaterThan(line.textRight)
  const empty = area.locator('[data-flex-empty]')
  await expect(empty).toHaveCSS('display', 'none')
  await expect(empty).toBeHidden()
  await area.getByRole('button', { name: '填充容器' }).click()
  await expect(empty).toHaveCSS('display', 'flex')
  await expect(empty).toBeVisible()
  await area.screenshot({ path: info.outputPath('inline-empty.png') })
  await area.getByRole('button', { name: '清空容器' }).click()
  await expect(empty).toHaveCSS('display', 'none')
})

// 组合卡片：宽屏时封面与内容同行，内层纵向容器按钮靠右下。
test('[flex.browser.combination] nested card layout', async ({ page }, info) => {
  const area = await demo(page, info, 'combination')
  const card = area.locator('[data-flex-combination]')
  const cover = card.getByRole('img', { name: '封面占位' }), button = card.getByRole('button', { name: '开始使用' })
  const [cardBox, coverBox, buttonBox] = await Promise.all([card.boundingBox(), cover.boundingBox(), button.boundingBox()])
  expect(Math.abs(coverBox!.x - cardBox!.x - 1)).toBeLessThan(0.6)
  // 内层 p-8(32px)：无论是否换行，按钮都贴卡片右下的内边距。
  expect(Math.abs(cardBox!.x + cardBox!.width - 1 - 32 - (buttonBox!.x + buttonBox!.width))).toBeLessThan(0.6)
  expect(Math.abs(cardBox!.y + cardBox!.height - 1 - 32 - (buttonBox!.y + buttonBox!.height))).toBeLessThan(0.6)
  // 容纳得下封面 273px + 内容最小 220px 时同行，否则 wrap 为上下结构（文档双栏网格即后者）。
  if (cardBox!.width - 2 >= 273 + 220) {
    expect(buttonBox!.x).toBeGreaterThan(coverBox!.x + coverBox!.width)
    expect(Math.abs(coverBox!.y + coverBox!.height - 32 - (buttonBox!.y + buttonBox!.height))).toBeLessThan(0.6)
  } else {
    expect(buttonBox!.y).toBeGreaterThan(coverBox!.y + coverBox!.height)
    expect(Math.abs(coverBox!.width - 273)).toBeLessThan(0.6)
  }
  await area.screenshot({ path: info.outputPath('combination.png') })
})

// 手机宽度下文档页无横向滚动，组合卡片换行为上下结构。
test('[flex.browser.mobile] no horizontal overflow on phones', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const area = await demo(page, info, 'combination')
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)
  const card = area.locator('[data-flex-combination]')
  const [coverBox, buttonBox] = await Promise.all([card.getByRole('img', { name: '封面占位' }).boundingBox(), card.getByRole('button', { name: '开始使用' }).boundingBox()])
  expect(buttonBox!.y).toBeGreaterThan(coverBox!.y + coverBox!.height)
  // 选项较多的 Segmented 在示例卡片内横向滚动，不会被卡片边界裁切。
  const groups = await page.locator('[data-demo^="flex/"] [role="radiogroup"]').all()
  // basic / align×2 / gap / wrap 共 5 组，避免选择器落空导致断言空转。
  expect(groups).toHaveLength(5)
  for (const group of groups) {
    const clipped = await group.evaluate(el => {
      // Segmented 必须位于横向滚动容器中，且该容器不越过示例根 Flex 的内容区。
      const scroller = el.parentElement!, root = scroller.parentElement!
      if (getComputedStyle(scroller).overflowX !== 'auto') return true
      const box = scroller.getBoundingClientRect(), content = root.getBoundingClientRect()
      return box.left < content.left - 0.5 || box.right > content.right + 0.5
    })
    expect(clipped, await group.getAttribute('aria-label') ?? '').toBe(false)
  }
  await page.locator('[data-demo="flex/align"]').scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath('mobile.png'), fullPage: false })
})

// 开发模式（未经构建）同样生成预设 gap 与任意属性对齐类。
test('[flex.browser.dev] development styles resolve', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE ?? '/'}${path}`)
  const gap = page.locator('[data-demo="flex/gap"] [data-flex-gap]')
  await expect(gap).toHaveCSS('column-gap', '8px')
  await page.locator('[data-demo="flex/gap"]').getByRole('radio', { name: 'large 24px' }).click()
  await expect(gap).toHaveCSS('column-gap', '24px')
  await expect(page.locator('[data-demo="flex/inline-empty"] [data-flex-empty]')).toHaveCSS('display', 'none')
  const value = await page.evaluate(() => {
    const el = document.createElement('div'); el.className = 'flex [justify-content:end] [align-items:self-end]'; document.body.append(el)
    const style = getComputedStyle(el); const result = `${style.justifyContent}/${style.alignItems}`; el.remove(); return result
  })
  expect(value).toBe('end/self-end')
})

// 原始静态 HTML 含 API、注意事项与同文件源码，不依赖客户端生成正文。
test('[flex.browser.ssr] API contracts and source', async ({ request }) => {
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  for (const text of ['FlexProps API', '与 Space 的区别', 'flex/inline-empty', 'orientation', 'empty:hidden', 'data-flex-toolbar']) expect(html).toContain(text)
})
