import { expect, type Locator, type Page, type TestInfo } from '@playwright/test'

export const tooltipDocsPath = 'components/data-display/tooltip/'
export const tooltipPlacements = [
  'topLeft', 'top', 'topRight', 'bottomLeft', 'bottom', 'bottomRight',
  'leftTop', 'left', 'leftBottom', 'rightTop', 'right', 'rightBottom',
] as const
export type TooltipPlacement = typeof tooltipPlacements[number]

export function tooltipPath(info: TestInfo) {
  return info.project.name === 'docs' ? tooltipDocsPath : 'Tooltip'
}

export function tooltipDemo(page: Page, info: TestInfo, id: string) {
  return page.locator(info.project.name === 'docs'
    ? `[data-demo="tooltip/${id}"]`
    : `[data-tooltip-demo="${id}"]`)
}

export async function gotoTooltip(page: Page, info: TestInfo, id: string) {
  await page.goto(tooltipPath(info))
  const demo = tooltipDemo(page, info, id)
  await expect(demo.getByRole('button').first()).toBeVisible()
  return demo
}

export function triggerButton(demo: Locator, name: string) {
  return demo.getByRole('button', { name, exact: true })
}

// Tooltip 没有 aria-controls/aria-haspopup 关联浮层，只能按可见文本区分同屏多个提示。
// 用 exact accessible name 而非子串 hasText：'top' 恰好是英文单词 "defaultOpen" 的子串
// （…defaul-TOP-en…），子串匹配会连带命中 controlled 演示里恒定挂载的 defaultOpen 提示。
export function tooltipLayer(page: Page, text: string) {
  return page.getByRole('tooltip', { name: text, exact: true })
}

// opacity=0 的浮层仍可能被 Playwright 认为可见，不能仅依赖 toBeVisible；懒销毁期间还保留 aria-hidden/inert。
export async function waitTooltipOpen(layer: Locator) {
  await expect(layer).toBeVisible()
  await expect(layer).toHaveCSS('visibility', 'visible')
  await expect(layer).toHaveCSS('opacity', '1')
  await expect(layer).not.toHaveAttribute('aria-hidden', 'true')
  await expect(layer).toHaveJSProperty('inert', false)
}

export async function waitTooltipClosed(layer: Locator) {
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
  // Playwright 的自动 scrollIntoView 只保证可见，不保证各方向有足够的浮层空间。
  await button.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }))
  await expect(button).toBeInViewport()
}

// Tooltip 的有效间距 = offset(4) + arrowPadding(8) = 12px，与 Dropdown 的 4px 不同。
// Tooltip 没有 aria-controls/id 关联浮层（不同于 Dropdown），不能像 Dropdown 那样按 id
// 在页面里重新查找浮层节点；"top" 又是 "topLeft"/"topRight" 的子串，按文案重新查找会
// 在同屏多个浮层同时存在时误命中。这里直接对已经精确解析出的 trigger/layer 两个
// Locator 分别取 boundingBox，不再依赖任何二次查找。
export async function expectTooltipPlacement(trigger: Locator, layer: Locator, placement: TooltipPlacement) {
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
