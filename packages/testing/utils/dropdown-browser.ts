import { expect, type Locator, type Page, type TestInfo } from '@playwright/test'

export const dropdownDocsPath = 'components/navigation/dropdown/'
export const dropdownPlacements = [
  'topLeft', 'top', 'topRight', 'bottomLeft', 'bottom', 'bottomRight',
  'leftTop', 'left', 'leftBottom', 'rightTop', 'right', 'rightBottom',
] as const
export type DropdownPlacement = typeof dropdownPlacements[number]

export function dropdownPath(info: TestInfo) {
  return info.project.name === 'docs' ? dropdownDocsPath : 'Dropdown'
}

export function dropdownDemo(page: Page, info: TestInfo, id: string) {
  return page.locator(info.project.name === 'docs'
    ? `[data-demo="dropdown/${id}"]`
    : `[data-dropdown-demo="${id}"]`)
}

export async function gotoDropdown(page: Page, info: TestInfo, id: string) {
  await page.goto(dropdownPath(info))
  const demo = dropdownDemo(page, info, id)
  await expect(demo.getByRole('button').first()).toBeVisible()
  return demo
}

export function triggerButton(demo: Locator, name: string) {
  return demo.getByRole('button', { name, exact: true })
}

// ARIA 状态在触发 wrapper 上；Portal 不能假定是示例 section 的后代。
export function triggerRoot(button: Locator) {
  return button.locator('xpath=ancestor::*[@aria-haspopup="menu"][1]')
}

export async function menuFor(page: Page, trigger: Locator) {
  await expect(trigger).toHaveAttribute('aria-controls', /.+/)
  const id = await trigger.getAttribute('aria-controls')
  if (!id) throw new Error('Dropdown trigger did not expose aria-controls after opening')
  return page.locator(`[role="menu"][id=${JSON.stringify(id)}]`)
}

// opacity=0 的菜单仍可能被 Playwright 认为可见，不能仅依赖 toBeVisible。
export async function waitMenuOpen(menu: Locator) {
  await expect(menu).toBeVisible()
  await expect(menu).toHaveCSS('visibility', 'visible')
  await expect(menu).toHaveCSS('opacity', '1')
  await expect(menu).not.toHaveAttribute('aria-hidden', 'true')
  await expect(menu).toHaveJSProperty('inert', false)
}

// 关闭动画后仍保留约 1300ms 的 DOM；不要把 toHaveCount(0) 当作即时关闭契约。
export async function waitMenuClosed(menu: Locator) {
  await expect.poll(() => menu.evaluateAll(elements => {
    if (elements.length === 0) return true
    const element = elements[0]
    const style = getComputedStyle(element)
    return element.getAttribute('aria-hidden') === 'true'
      && (style.visibility === 'hidden' || style.opacity === '0')
  })).toBe(true)
}

export function output(demo: Locator, prefix: string) {
  return demo.locator('output').filter({ hasText: prefix })
}

export async function centerTrigger(button: Locator) {
  // Playwright 的自动 scrollIntoView 只保证可见，不保证各方向有足够的浮层空间。
  await button.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }))
  await expect(button).toBeInViewport()
}

export async function rect(locator: Locator) {
  return locator.evaluate(element => {
    const box = element.getBoundingClientRect()
    return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height }
  })
}

export async function expectPlacement(trigger: Locator, menu: Locator, placement: DropdownPlacement) {
  const id = await menu.getAttribute('id')
  if (!id) throw new Error('Dropdown menu has no id')
  // 从同一帧读取两个真实 DOMRect；不调用 production measurePlacement 来自证算法。
  await expect.poll(() => trigger.evaluate((element, args) => {
    const layer = document.getElementById(args.id)
    if (!layer) return Number.POSITIVE_INFINITY
    const anchor = element.getBoundingClientRect()
    const menu = layer.getBoundingClientRect()
    const { placement } = args
    const vertical = placement.startsWith('top') || placement.startsWith('bottom')
    const main = vertical
      ? placement.startsWith('top') ? anchor.top - menu.bottom : menu.top - anchor.bottom
      : placement.startsWith('left') ? anchor.left - menu.right : menu.left - anchor.right
    const cross = vertical
      ? placement.endsWith('Left') ? menu.left - anchor.left
        : placement.endsWith('Right') ? menu.right - anchor.right
          : (menu.left + menu.right - anchor.left - anchor.right) / 2
      : placement.endsWith('Top') ? menu.top - anchor.top
        : placement.endsWith('Bottom') ? menu.bottom - anchor.bottom
          : (menu.top + menu.bottom - anchor.top - anchor.bottom) / 2
    return Math.max(Math.abs(main - 4), Math.abs(cross))
  }, { id, placement }), { message: `${placement} 的实际边缘/中心对齐与 4px 间距` }).toBeLessThanOrEqual(2)
}
