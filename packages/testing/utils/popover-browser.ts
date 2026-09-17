import { expect, type Locator, type Page, type TestInfo } from '@playwright/test'

export const popoverDocsPath = 'components/data-display/popover/'
export const popoverPlacements = [
  'topLeft', 'top', 'topRight', 'bottomLeft', 'bottom', 'bottomRight',
  'leftTop', 'left', 'leftBottom', 'rightTop', 'right', 'rightBottom',
] as const
export type PopoverPlacement = typeof popoverPlacements[number]

export function popoverPath(info: TestInfo) {
  return info.project.name === 'docs' ? popoverDocsPath : 'Popover'
}

export function popoverDemo(page: Page, info: TestInfo, id: string) {
  return page.locator(info.project.name === 'docs'
    ? `[data-demo="popover/${id}"]`
    : `[data-popover-demo="${id}"]`)
}

export async function gotoPopover(page: Page, info: TestInfo, id: string) {
  await page.goto(popoverPath(info))
  const demo = popoverDemo(page, info, id)
  await expect(demo.getByRole('button').first()).toBeVisible()
  return demo
}

export function triggerButton(demo: Locator, name: string) {
  return demo.getByRole('button', { name, exact: true })
}

// role=dialog 不像 role=tooltip 那样支持 "name from content"（ARIA accname 规范），
// getByRole('dialog', {name}) 匹配不到任何元素——只能回退到 hasText 子串匹配；卡片
// 的 textContent 是 title+content 拼接，不能用整串精确锚定。调用方必须传入一个足够
// specific、且不与任何其他 demo 的卡片文本互为子串的片段（例如占位符 defaultOpen 的
// demo 卡片文本恰好包含 "top" 子串——Tooltip 回归已踩过这个坑；placement 场景请传
// `placement=${placement}` 而不是裸 placement 名）。
export function popoverLayer(page: Page, text: string) {
  return page.locator('[role="dialog"]', { hasText: text })
}

export async function waitPopoverOpen(layer: Locator) {
  await expect(layer).toBeVisible()
  await expect(layer).toHaveCSS('visibility', 'visible')
  await expect(layer).toHaveCSS('opacity', '1')
  await expect(layer).not.toHaveAttribute('aria-hidden', 'true')
  await expect(layer).toHaveJSProperty('inert', false)
}

export async function waitPopoverClosed(layer: Locator) {
  await expect.poll(() => layer.evaluateAll(elements => {
    if (elements.length === 0) return true
    const element = elements[0]
    const style = getComputedStyle(element)
    return element.getAttribute('aria-hidden') === 'true'
      && (element as HTMLElement).inert === true
      && (style.visibility === 'hidden' || style.opacity === '0')
  })).toBe(true)
}

export async function centerTrigger(button: Locator) {
  await button.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }))
  await expect(button).toBeInViewport()
}

// Popover 有效间距 = offset(4) + arrowPadding(8) = 12px，与 Tooltip 相同、与 Dropdown 的 4px 不同。
export async function expectPopoverPlacement(trigger: Locator, layer: Locator, placement: PopoverPlacement) {
  await expect.poll(async () => {
    const anchor = await trigger.boundingBox()
    const menu = await layer.boundingBox()
    if (!anchor || !menu) return Number.POSITIVE_INFINITY
    const vertical = placement.startsWith('top') || placement.startsWith('bottom')
    const anchorRight = anchor.x + anchor.width
    const anchorBottom = anchor.y + anchor.height
    const menuRight = menu.x + menu.width
    const menuBottom = menu.y + menu.height
    const main = vertical
      ? placement.startsWith('top') ? anchor.y - menuBottom : menu.y - anchorBottom
      : placement.startsWith('left') ? anchor.x - menuRight : menu.x - anchorRight
    const cross = vertical
      ? placement.endsWith('Left') ? menu.x - anchor.x
        : placement.endsWith('Right') ? menuRight - anchorRight
          : (menu.x + menuRight - anchor.x - anchorRight) / 2
      : placement.endsWith('Top') ? menu.y - anchor.y
        : placement.endsWith('Bottom') ? menuBottom - anchorBottom
          : (menu.y + menuBottom - anchor.y - anchorBottom) / 2
    return Math.max(Math.abs(main - 12), Math.abs(cross))
  }, { message: `${placement} 的实际边缘/中心对齐与 12px 间距` }).toBeLessThanOrEqual(2)
}
