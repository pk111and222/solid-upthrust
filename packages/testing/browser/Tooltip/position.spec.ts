import { expect, test } from '@playwright/test'
import {
  centerTrigger,
  expectTooltipPlacement,
  gotoTooltip,
  tooltipLayer,
  tooltipPlacements,
  triggerButton,
  waitTooltipOpen,
} from '../../utils/tooltip-browser'

// 十二种方向均按实际边缘/中心对齐 12px 间距（offset 4 + arrowPadding 8）。
for (const placement of tooltipPlacements) {
  test(`[tooltip.position.all] ${placement}`, async ({ page }, info) => {
    const demo = await gotoTooltip(page, info, 'placement')
    const button = triggerButton(demo, placement)
    await centerTrigger(button)
    await button.hover()
    const layer = tooltipLayer(page, placement)
    await waitTooltipOpen(layer)
    await expectTooltipPlacement(button, layer, placement)
    // 箭头必须存在且贴合浮层朝向触发器的一侧。
    await expect(layer.locator('span.rotate-45')).toHaveCount(1)
  })
}

// 页面滚动后 absolute 浮层仍须以触发器为锚点重新测量。
test('[tooltip.position.scroll] 滚动后仍保持锚点', async ({ page }, info) => {
  const demo = await gotoTooltip(page, info, 'placement')
  const button = triggerButton(demo, 'bottom')
  await centerTrigger(button)
  await button.hover()
  const layer = tooltipLayer(page, 'bottom')
  await waitTooltipOpen(layer)
  await expectTooltipPlacement(button, layer, 'bottom')
  await page.evaluate(() => window.scrollBy(0, 60))
  await expectTooltipPlacement(button, layer, 'bottom')
})
