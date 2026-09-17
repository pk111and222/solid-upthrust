import { expect, test } from '@playwright/test'
import {
  centerTrigger,
  gotoPopover,
  popoverLayer,
  triggerButton,
  waitPopoverClosed,
  waitPopoverOpen,
} from '../../utils/popover-browser'

// hover 即时打开（0ms，与 Tooltip 的 100ms 默认延迟不同）；关闭沿用 100ms 默认防抖，
// 与 Tooltip 一样使用宽余量区间，不卡精确边界（原因见 Tooltip 回归记录）。
test('[popover.browser.hover-instant-open] 悬停即时打开、默认延迟关闭', async ({ page }, info) => {
  await page.clock.install()
  const demo = await gotoPopover(page, info, 'basic')
  const button = triggerButton(demo, '悬停查看卡片')
  await centerTrigger(button)
  const layer = popoverLayer(page, '卡片标题')
  await button.hover()
  await waitPopoverOpen(layer)

  await page.mouse.move(1, 1)
  await page.clock.runFor(30)
  await waitPopoverOpen(layer)
  await page.clock.runFor(200)
  await waitPopoverClosed(layer)
})

// title 和 content 都为空时永不弹出，即使真实悬停等待也不会出现。
test('[popover.browser.empty-content] title/content 都为空不产生浮层', async ({ page }, info) => {
  const demo = await gotoPopover(page, info, 'basic')
  const button = triggerButton(demo, 'title/content 都为空，不会打开')
  await centerTrigger(button)
  const before = await page.locator('[role="dialog"]').count()
  await button.hover()
  await page.waitForTimeout(200)
  await expect(page.locator('[role="dialog"]')).toHaveCount(before)
})

// click 同步切换，点击浮层外部也会关闭（共享 Trigger 的通用 outside-dismiss）。
test('[popover.browser.click] 点击同步开关与外部点击关闭', async ({ page }, info) => {
  const demo = await gotoPopover(page, info, 'trigger')
  const button = triggerButton(demo, 'click')
  await centerTrigger(button)
  const layer = popoverLayer(page, '点击触发')
  await button.click()
  await waitPopoverOpen(layer)
  await page.mouse.click(1, 1)
  await waitPopoverClosed(layer)
})

// focus 触发用于键盘可达性：Tab 聚焦打开，聚焦离开关闭。
test('[popover.browser.focus] 键盘 Tab 聚焦触发', async ({ page }, info) => {
  const demo = await gotoPopover(page, info, 'trigger')
  const button = triggerButton(demo, 'focus（可用 Tab 聚焦）')
  await centerTrigger(button)
  const layer = popoverLayer(page, '聚焦触发')
  await button.focus()
  await waitPopoverOpen(layer)
  await page.keyboard.press('Tab')
  await waitPopoverClosed(layer)
})

// 内容可以承载真实交互元素：点击卡片内部按钮不会关闭浮层，且回调正确触发。
test('[popover.browser.interactive-content] 卡片内按钮可交互且不误触发关闭', async ({ page }, info) => {
  const demo = await gotoPopover(page, info, 'basic')
  const button = triggerButton(demo, '悬停查看卡片')
  await centerTrigger(button)
  const layer = popoverLayer(page, '卡片标题')
  await button.hover()
  await waitPopoverOpen(layer)
  const inner = layer.getByRole('button', { name: /点了 \d+ 次/ })
  await expect(inner).toHaveText('点了 0 次')
  await inner.click()
  await expect(inner).toHaveText('点了 1 次')
  await waitPopoverOpen(layer)
})

// disabled 动态切换：为 true 时悬停不产生任何浮层；恢复后立即可用。
test('[popover.browser.disabled-dynamic] 动态 disabled 阻止/恢复触发', async ({ page }, info) => {
  const demo = await gotoPopover(page, info, 'disabled')
  const toggle = demo.getByRole('button', { name: /启用触发器|禁用触发器/ })
  const button = demo.getByRole('button', { name: '动态 disabled', exact: true })
  await centerTrigger(button)
  await expect(toggle).toHaveText('启用触发器') // 默认 disabled=true
  await button.hover()
  await expect(page.locator('[role="dialog"]', { hasText: 'disabled 为 true 时永不出现' })).toHaveCount(0)

  await toggle.click()
  await expect(toggle).toHaveText('禁用触发器')
  await button.hover()
  await waitPopoverOpen(popoverLayer(page, '禁用状态'))
})

// class/style 只作用于根容器；overlayClass/overlayStyle 只作用于浮层，互不污染。
test('[popover.browser.style] class/style 与 overlayClass/overlayStyle 分离生效', async ({ page }, info) => {
  const demo = await gotoPopover(page, info, 'style')
  const rootButton = triggerButton(demo, 'root class/style')
  const root = rootButton.locator('xpath=ancestor::div[contains(@class,"relative") and contains(@class,"inline-block")][1]')
  await expect(root).toHaveCSS('padding', '2px')

  const overlayButton = triggerButton(demo, 'overlayClass/overlayStyle')
  await centerTrigger(overlayButton)
  const overlayLayer = popoverLayer(page, '浮层 overlayClass/overlayStyle')
  await overlayButton.hover()
  await waitPopoverOpen(overlayLayer)
  await expect(overlayLayer).toHaveCSS('font-weight', '700')
})

// getContainer 让浮层脱离最近的局部主题 Portal 容器，直接挂到 document.body。
test('[popover.browser.container] getContainer 改变实际挂载点', async ({ page }, info) => {
  const demo = await gotoPopover(page, info, 'container')
  const themed = triggerButton(demo, '局部主题卡片')
  await centerTrigger(themed)
  await themed.hover()
  const themedLayer = popoverLayer(page, '局部主题卡片')
  await waitPopoverOpen(themedLayer)
  await expect(themedLayer.locator('xpath=ancestor::*[@data-upthrust-config][1]')).toHaveCount(1)

  const bodyButton = triggerButton(demo, 'getContainer=body')
  await centerTrigger(bodyButton)
  await bodyButton.hover()
  const bodyLayer = popoverLayer(page, '自定义容器')
  await waitPopoverOpen(bodyLayer)
  await expect(bodyLayer.locator('xpath=parent::body')).toHaveCount(1)
})

// 开发服务器与静态构建一样验证真实浮层可见性。
test('[popover.browser.dev] 开发页面悬停验证', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE ?? '/'}components/data-display/popover/`)
  const button = page.locator('[data-demo="popover/basic"]').getByRole('button', { name: '悬停查看卡片', exact: true })
  await centerTrigger(button)
  await button.hover()
  const layer = popoverLayer(page, '卡片标题')
  await waitPopoverOpen(layer)
  await expect(layer).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
})
