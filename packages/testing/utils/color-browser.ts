import type { Locator } from '@playwright/test'

/**
 * wind4 把任意色值编译为 color-mix(in oklab, …)，Chromium 的计算值随之序列化为 oklab(...)。
 * 在页面里用 canvas 把计算色绘制成像素，统一返回 `rgb(r, g, b)` / `rgba(r, g, b, a)`（a 保留两位）。
 */
export const paintedColor = (locator: Locator, property: string, pseudo?: string) =>
  locator.evaluate((el, [prop, pseudoElement]) => {
    const value = getComputedStyle(el, pseudoElement || undefined).getPropertyValue(prop)
    const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
    context.clearRect(0, 0, 1, 1); context.fillStyle = value; context.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data
    return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${Math.round(a / 255 * 100) / 100})`
  }, [property, pseudo ?? ''] as const)
