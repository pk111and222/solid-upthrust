import { expect, test } from '@playwright/test'
import {
  centerTrigger,
  gotoTooltip,
  tooltipLayer,
  triggerButton,
  waitTooltipClosed,
  waitTooltipOpen,
} from '../../utils/tooltip-browser'

// 默认 hover 有 100ms 打开/关闭延迟；关闭后浮层仍挂载但必须 aria-hidden/inert。
// 注意：Playwright 的 web-first 断言（toHaveCount/toBeVisible 等）在两次 runFor 之间可能消耗
// 少量虚拟时间，不能拿它们卡在恰好 99ms/100ms 的边界上；并行跑全量套件时 CPU 争抢还会引入
// 额外抖动。这里按 Dropdown 既有用例的约定（对 100ms 阈值用 200ms 的安全余量）取值，
// 只验证“明显未到延迟”与“明显已超过延迟”两个宽余量区间，边界精度已由 headless/Tooltip 覆盖。
test('[tooltip.browser.hover-default-delay] 悬停延迟打开与关闭', async ({ page }, info) => {
  await page.clock.install()
  const demo = await gotoTooltip(page, info, 'basic')
  const button = triggerButton(demo, '悬停我')
  await centerTrigger(button)
  await button.hover()
  const layer = tooltipLayer(page, '默认提示（上方，悬停 100ms 后出现）')
  await page.clock.runFor(30)
  await expect(layer).toHaveCount(0)
  await page.clock.runFor(200)
  await waitTooltipOpen(layer)

  await page.mouse.move(1, 1)
  await page.clock.runFor(30)
  await waitTooltipOpen(layer)
  await page.clock.runFor(200)
  await waitTooltipClosed(layer)
})

// title=false 与空标题一样永不弹出，即使真实悬停等待也不会出现。
// title=false 时不渲染任何文本，无法用文案定位这一个按钮自己的浮层；Tooltip 浮层又经
// Portal 渡到 document.body，不是 demo 区块的 DOM 后代。改为记录悬停前的全页面
// [role="tooltip"] 数量基线（包含其他 demo 的既有浮层，例如 defaultOpen 的那个），
// 悬停等待后数量必须不变——disabled 恒为 true 时 mounted() 恒为 false，
// 懒挂载的 DOM 不应新增。
test('[tooltip.browser.title-false] title=false 不产生浮层', async ({ page }, info) => {
  await page.clock.install()
  const demo = await gotoTooltip(page, info, 'basic')
  const button = triggerButton(demo, 'title=false 不弹出')
  await centerTrigger(button)
  const before = await page.locator('[role="tooltip"]').count()
  await button.hover()
  await page.clock.runFor(500)
  await expect(page.locator('[role="tooltip"]')).toHaveCount(before)
})

// click 同步切换，且点击浮层外部也会关闭（共享 Trigger 的通用 outside-dismiss）。
test('[tooltip.browser.click] 点击同步开关与外部点击关闭', async ({ page }, info) => {
  const demo = await gotoTooltip(page, info, 'trigger')
  const button = triggerButton(demo, 'click')
  await centerTrigger(button)
  const layer = tooltipLayer(page, '点击触发，再次点击关闭')
  await button.click()
  await waitTooltipOpen(layer)
  await page.mouse.click(1, 1)
  await waitTooltipClosed(layer)
})

// focus 触发用于键盘可达性：Tab 聚焦打开，聚焦离开关闭。
test('[tooltip.browser.focus] 键盘 Tab 聚焦触发', async ({ page }, info) => {
  const demo = await gotoTooltip(page, info, 'trigger')
  const button = triggerButton(demo, 'focus（可用 Tab 聚焦）')
  await centerTrigger(button)
  const layer = tooltipLayer(page, '聚焦触发，Tab 到此按钮即可看到')
  await button.focus()
  await waitTooltipOpen(layer)
  await page.keyboard.press('Tab')
  await waitTooltipClosed(layer)
})

// 鼠标移到浮层本体上应取消关闭倒计时，这是 Tooltip 自身 bindLayerHover 接线的真实浏览器验证。
test('[tooltip.browser.layer-hover] 悬停到浮层本体保持打开', async ({ page }, info) => {
  await page.clock.install()
  const demo = await gotoTooltip(page, info, 'basic')
  const button = triggerButton(demo, '悬停我')
  await centerTrigger(button)
  await button.hover()
  await page.clock.runFor(200)
  const layer = tooltipLayer(page, '默认提示（上方，悬停 100ms 后出现）')
  await waitTooltipOpen(layer)

  const box = await layer.boundingBox()
  if (!box) throw new Error('tooltip layer has no bounding box')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.clock.runFor(200)
  await waitTooltipOpen(layer)

  await page.mouse.move(1, 1)
  await page.clock.runFor(200)
  await waitTooltipClosed(layer)
})

// disabled 动态切换：为 true 时悬停不产生任何浮层；恢复后立即可用。
test('[tooltip.browser.disabled-dynamic] 动态 disabled 阻止/恢复触发', async ({ page }, info) => {
  const demo = await gotoTooltip(page, info, 'disabled-delay')
  const toggle = demo.getByRole('button', { name: /启用触发器|禁用触发器/ })
  const button = demo.getByRole('button', { name: '动态 disabled', exact: true })
  await centerTrigger(button)
  await expect(toggle).toHaveText('启用触发器') // 默认 disabled=true
  await button.hover()
  await expect(page.locator('[role="tooltip"]', { hasText: 'disabled 为 true 时永不出现' })).toHaveCount(0)

  await toggle.click()
  await expect(toggle).toHaveText('禁用触发器')
  await button.hover()
  await waitTooltipOpen(tooltipLayer(page, 'disabled 为 true 时永不出现'))
})

// 自定义 mouseEnterDelay/mouseLeaveDelay 必须覆盖默认 100ms；区间留有余量，理由见上方注释。
test('[tooltip.browser.custom-delay] 自定义延迟覆盖默认值', async ({ page }, info) => {
  await page.clock.install()
  const demo = await gotoTooltip(page, info, 'disabled-delay')
  const openButton = triggerButton(demo, '延迟打开')
  await centerTrigger(openButton)
  const openLayer = tooltipLayer(page, '悬停 500ms 后才显示')
  await openButton.hover()
  await page.clock.runFor(300)
  await expect(openLayer).toHaveCount(0)
  await page.clock.runFor(300)
  await waitTooltipOpen(openLayer)

  const closeButton = triggerButton(demo, '延迟关闭')
  await centerTrigger(closeButton)
  const closeLayer = tooltipLayer(page, '离开 800ms 后才隐藏，可移到浮层上暂停倒计时')
  await closeButton.hover()
  await page.clock.runFor(100)
  await waitTooltipOpen(closeLayer)
  await page.mouse.move(1, 1)
  await page.clock.runFor(600)
  await waitTooltipOpen(closeLayer)
  await page.clock.runFor(300)
  await waitTooltipClosed(closeLayer)
})

// class/style 只作用于根容器；overlayClass/overlayStyle 只作用于浮层，互不污染。
test('[tooltip.browser.style] class/style 与 overlayClass/overlayStyle 分离生效', async ({ page }, info) => {
  const demo = await gotoTooltip(page, info, 'style')
  const rootButton = triggerButton(demo, 'root class/style')
  const root = rootButton.locator('xpath=ancestor::div[contains(@class,"relative") and contains(@class,"inline-block")][1]')
  await expect(root).toHaveCSS('padding', '2px')

  const overlayButton = triggerButton(demo, 'overlayClass/overlayStyle')
  await centerTrigger(overlayButton)
  const overlayLayer = tooltipLayer(page, '浮层 overlayClass/overlayStyle：自定义背景与加粗')
  await overlayButton.hover()
  await waitTooltipOpen(overlayLayer)
  await expect(overlayLayer).toHaveCSS('font-weight', '700')
})

// getContainer 让浮层脱离最近的局部主题 Portal 容器，直接挂到 document.body。
test('[tooltip.browser.container] getContainer 改变实际挂载点', async ({ page }, info) => {
  const demo = await gotoTooltip(page, info, 'container')
  const themed = triggerButton(demo, '局部主题提示')
  await centerTrigger(themed)
  await themed.hover()
  const themedLayer = tooltipLayer(page, '继承局部主题 surface/onSurface')
  await waitTooltipOpen(themedLayer)
  await expect(themedLayer.locator('xpath=ancestor::*[@data-upthrust-config][1]')).toHaveCount(1)

  const bodyButton = triggerButton(demo, 'getContainer=body')
  await centerTrigger(bodyButton)
  await bodyButton.hover()
  const bodyLayer = tooltipLayer(page, '通过 getContainer 挂载到 document.body，不再跟随局部主题')
  await waitTooltipOpen(bodyLayer)
  await expect(bodyLayer.locator('xpath=parent::body')).toHaveCount(1)
})

// ref 暴露的 open()/setOpen() 可在非受控模式下命令式控制显隐。
test('[tooltip.browser.ref] ref 命令式打开与关闭', async ({ page }, info) => {
  const demo = await gotoTooltip(page, info, 'ref')
  const toggle = demo.getByRole('button', { name: /通过 ref (打开|关闭)/ })
  const layer = tooltipLayer(page, '通过 ref.setOpen 命令式控制')
  await expect(toggle).toHaveText('通过 ref 打开')
  await toggle.click()
  await expect(toggle).toHaveText('通过 ref 关闭')
  await waitTooltipOpen(layer)
  await toggle.click()
  await expect(toggle).toHaveText('通过 ref 打开')
  await waitTooltipClosed(layer)
})

// 开发服务器与静态构建一样验证真实浮层可见性，捕获仅在开发未编译样式下才会暴露的问题。
test('[tooltip.browser.dev] 开发页面悬停验证', async ({ page }) => {
  await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE ?? '/'}components/data-display/tooltip/`)
  const button = page.locator('[data-demo="tooltip/basic"]').getByRole('button', { name: '悬停我', exact: true })
  await centerTrigger(button)
  await button.hover()
  const layer = tooltipLayer(page, '默认提示（上方，悬停 100ms 后出现）')
  await waitTooltipOpen(layer)
  // 不同 Chromium 版本可能用 rgb(...) 或 color(srgb ...) 表示同一底色，不锚定具体语法；
  // 只确认开发模式下主题背景真的被着色，而非 transparent/空字符串。
  await expect(layer).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  const bg = await layer.evaluate(el => getComputedStyle(el).backgroundColor)
  expect(bg.length).toBeGreaterThan(0)
})
