import { expect, test } from '@playwright/test'
import { gotoTabs, tab, tabsDemo } from '../../utils/tabs-browser'

// 回归：方向键切换 activeKey 后 DOM 焦点必须跟随移动到新激活标签（WAI-ARIA APG 单一
// Tab 停靠点模式）；happy-dom 的 L3 用例已覆盖同一断言，这里用真实浏览器复核。
test('[tabs.browser.keyboard-focus-follows] 方向键切换后焦点跟随移动到新标签', async ({ page }, info) => {
  const demo = await gotoTabs(page, info, 'basic')
  const first = tab(demo, '选项卡一')
  await first.focus()
  await expect(first).toBeFocused()
  await page.keyboard.press('ArrowRight')
  const second = tab(demo, '选项卡二')
  await expect(second).toBeFocused()
  await expect(second).toHaveAttribute('aria-selected', 'true')
  // 单一 Tab 停靠点：tablist 容器不占用独立停靠点，只有激活标签是 tabindex=0。
  await expect(demo.getByRole('tablist')).toHaveAttribute('tabindex', '-1')
  await expect(first).toHaveAttribute('tabindex', '-1')
  await expect(second).toHaveAttribute('tabindex', '0')
})

// 禁用标签被键盘方向导航跳过，点击也无效。
test('[tabs.browser.disabled-skip] 禁用标签被键盘导航跳过且不可点击', async ({ page }, info) => {
  const demo = await gotoTabs(page, info, 'disabled')
  const firstEnabled = tab(demo, '可用').first()
  await firstEnabled.focus()
  await page.keyboard.press('ArrowRight')
  const secondEnabled = tab(demo, '可用').nth(1)
  await expect(secondEnabled).toBeFocused()
  await expect(secondEnabled).toHaveAttribute('aria-selected', 'true')

  const disabled = demo.getByRole('tab', { name: '禁用', exact: true })
  await expect(disabled).toHaveAttribute('aria-disabled', 'true')
  await disabled.click({ force: true })
  // 强制指针点击仍不应改变选中项——组件自身在 setActiveKey 里拦截了禁用项。
  await expect(secondEnabled).toHaveAttribute('aria-selected', 'true')
})

// 受控模式：外部信号驱动 activeKey，面板内容随之更新；不依赖用户点击组件自身。
test('[tabs.browser.controlled] 受控 activeKey 驱动面板内容更新', async ({ page }, info) => {
  const demo = await gotoTabs(page, info, 'controlled')
  await expect(demo.getByRole('tabpanel')).toContainText('当前选中 1')
  await tab(demo, '标签三').click()
  await expect(demo.getByRole('tabpanel')).toContainText('当前选中 3')
  await expect(tab(demo, '标签三')).toHaveAttribute('aria-selected', 'true')
})

// line 类型的 ink bar 必须在挂载后紧贴激活标签，横向覆盖其宽度（真实几何测量）。
test('[tabs.browser.ink-bar] 滑动指示条对齐激活标签的实际几何位置', async ({ page }, info) => {
  const demo = await gotoTabs(page, info, 'basic')
  const active = tab(demo, '选项卡一')
  const activeBox = (await active.boundingBox())!
  const inkBar = demo.locator('[role="tablist"] > div:not([role])')
  await expect(inkBar).toHaveCSS('opacity', '1')
  const barBox = (await inkBar.boundingBox())!
  expect(Math.abs(barBox.x - activeBox.x)).toBeLessThanOrEqual(2)
  expect(Math.abs(barBox.width - activeBox.width)).toBeLessThanOrEqual(2)

  await tab(demo, '选项卡二').click()
  const secondBox = (await tab(demo, '选项卡二').boundingBox())!
  await expect.poll(async () => {
    const box = (await inkBar.boundingBox())!
    return Math.abs(box.x - secondBox.x) <= 2 && Math.abs(box.width - secondBox.width) <= 2
  }, { message: '指示条应滑动到选项卡二的位置' }).toBe(true)
})

// card 类型没有滑动指示条；卡片自身边框构成视觉结构。
test('[tabs.browser.card-no-ink-bar] card 类型不渲染滑动指示条', async ({ page }, info) => {
  const demo = await gotoTabs(page, info, 'card')
  await expect(demo.locator('[role="tablist"] > div:not([role])')).toHaveCount(0)
})

// 可编辑页签：新增、关闭、Alt+方向键排序全流程；固定页签（closable:false）不可关闭。
test('[tabs.browser.editable] 新增、关闭与键盘排序的完整流程', async ({ page }, info) => {
  const demo = await gotoTabs(page, info, 'editable')
  const tablist = demo.getByRole('tablist')
  const initialCount = await tablist.getByRole('tab').count()

  // 回归：新增按钮曾缺少 inline-flex，图标 span 停留在默认 display:inline，
  // width/height 对 inline 级盒子不生效，图标塌缩成 0×0——按钮本身仍可点击（hit
  // 区域完整），只是看不见"+"。happy-dom 不做真实布局，这类问题只能在真实浏览器发现。
  const addButton = demo.getByRole('button', { name: '新增页签' })
  const addIcon = addButton.locator('span')
  const iconBox = await addIcon.boundingBox()
  expect(iconBox?.width).toBeGreaterThan(0)
  expect(iconBox?.height).toBeGreaterThan(0)
  // 图标可见还不够：按钮拉伸后仍需水平、垂直居中。
  const buttonBox = (await addButton.boundingBox())!
  expect(Math.abs(iconBox!.x + iconBox!.width / 2 - buttonBox.x - buttonBox.width / 2)).toBeLessThanOrEqual(1)
  expect(Math.abs(iconBox!.y + iconBox!.height / 2 - buttonBox.y - buttonBox.height / 2)).toBeLessThanOrEqual(1)

  await addButton.click()
  await expect(tablist.getByRole('tab')).toHaveCount(initialCount + 1)

  const fixed = tablist.getByRole('tab', { name: /固定页签/ })
  await expect(fixed.getByRole('button')).toHaveCount(0) // closable:false 不渲染关闭按钮

  // 关闭按钮的可访问名形如 "关闭 <label>"；固定页签没有关闭按钮，其余标签都有，
  // 直接找第一个存在的关闭按钮点击即可，不需要先定位它所属的哪个 closable 标签。
  const closeButton = tablist.locator('[aria-label^="关闭 "]').first()
  await closeButton.click()
  await expect(tablist.getByRole('tab')).toHaveCount(initialCount)

  await fixed.focus()
  await page.keyboard.press('Delete')
  await expect(fixed).toBeVisible() // 固定页签不可关闭，Delete 无效

  const beforeOrderFirst = await tablist.getByRole('tab').first().textContent()
  await page.keyboard.press('Alt+ArrowRight')
  const afterOrderFirst = await tablist.getByRole('tab').first().textContent()
  expect(afterOrderFirst).not.toBe(beforeOrderFirst) // 排序确实发生了交换
})

// ref 命令式接口：nextTab/prevTab/setActiveKey 在真实浏览器中均生效。
test('[tabs.browser.ref] ref 暴露的命令式接口在真实浏览器中生效', async ({ page }, info) => {
  const demo = await gotoTabs(page, info, 'ref')
  await demo.getByRole('button', { name: '跳到选项卡三' }).click()
  await expect(tab(demo, '选项卡三')).toHaveAttribute('aria-selected', 'true')
  await demo.getByRole('button', { name: '上一个' }).click()
  await expect(tab(demo, '选项卡二')).toHaveAttribute('aria-selected', 'true')
  await demo.getByRole('button', { name: '下一个' }).click()
  await expect(tab(demo, '选项卡三')).toHaveAttribute('aria-selected', 'true')
})

// 开发服务器与静态构建一样验证真实标签切换与样式。
test('[tabs.browser.dev] 开发页面标签切换验证', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE ?? '/'}components/navigation/tabs/`)
  const demo = page.locator('[data-demo="tabs/basic"]')
  await expect(demo.getByRole('tab').first()).toBeVisible()
  await tab(demo, '选项卡二').click()
  await expect(tab(demo, '选项卡二')).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByRole('tabpanel')).toContainText('选项卡二的内容')
})

// 新增按钮随页签栏拉伸时，图标仍须在按钮内双轴居中，不能只验证非零尺寸。
test('[tabs.browser.dev.add-icon-center] 可编辑页签新增图标居中', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE ?? '/'}components/navigation/tabs/`)
  const button = page.locator('[data-demo="tabs/editable"]').getByRole('button', { name: '新增页签' })
  await expect(button).toBeVisible()
  const offset = await button.evaluate(el => {
    const button = el.getBoundingClientRect()
    const icon = el.querySelector('span')!.getBoundingClientRect()
    return { x: Math.abs(icon.x + icon.width / 2 - button.x - button.width / 2), y: Math.abs(icon.y + icon.height / 2 - button.y - button.height / 2) }
  })
  expect(offset.x).toBeLessThanOrEqual(1)
  expect(offset.y).toBeLessThanOrEqual(1)
})
