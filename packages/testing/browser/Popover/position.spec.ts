import { expect, test } from '@playwright/test'
import {
  centerTrigger,
  expectPopoverPlacement,
  gotoPopover,
  popoverLayer,
  popoverPlacements,
  triggerButton,
  waitPopoverOpen,
} from '../../utils/popover-browser'

// 十二种方向均按实际边缘/中心对齐 12px 间距（offset 4 + arrowPadding 8）。
for (const placement of popoverPlacements) {
  test(`[popover.position.all] ${placement}`, async ({ page }, info) => {
    const demo = await gotoPopover(page, info, 'placement')
    const button = triggerButton(demo, placement)
    await centerTrigger(button)
    await button.hover()
    const layer = popoverLayer(page, `placement=${placement}`)
    await waitPopoverOpen(layer)
    await expectPopoverPlacement(button, layer, placement)
    await expect(layer.locator('span.rotate-45')).toHaveCount(1)
  })
}

// 页面滚动后 absolute 浮层仍须以触发器为锚点重新测量。
test('[popover.position.scroll] 滚动后仍保持锚点', async ({ page }, info) => {
  const demo = await gotoPopover(page, info, 'placement')
  const button = triggerButton(demo, 'bottom')
  await centerTrigger(button)
  await button.hover()
  const layer = popoverLayer(page, 'placement=bottom')
  await waitPopoverOpen(layer)
  await expectPopoverPlacement(button, layer, 'bottom')
  await page.evaluate(() => window.scrollBy(0, 60))
  await expectPopoverPlacement(button, layer, 'bottom')
})
