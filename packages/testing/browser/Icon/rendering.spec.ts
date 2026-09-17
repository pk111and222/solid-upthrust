import { expect, test } from '@playwright/test'
// 检查真实 mask 绘制、尺寸、动画及鼠标/键盘交互，独立示例各自验证。
test('[icon.browser.paint] 图标实际绘制与交互', async ({ page }, info) => {
  const isDocs = info.project.name === 'docs'
  await page.goto(isDocs ? 'components/general/icon/' : 'Icon')
  const demo = isDocs ? page.locator('[data-demo="icon/action"]') : page.locator('[data-appid="content"]')
  if (isDocs) await expect(demo).toHaveAttribute('data-demo-state','ready')
  const star = demo.getByRole('button',{name:'收藏'}).locator('span.i-mdi-star')
  await expect(star).toHaveCSS('font-size','32px')
  expect(await star.evaluate(el => getComputedStyle(el).maskImage)).not.toBe('none')
  await demo.getByRole('button',{name:'收藏'}).press('Enter')
  await expect(demo.locator('output')).toHaveText('收藏次数：1')
  const spin = isDocs ? page.locator('[data-demo="icon/spin"]') : demo
  await spin.getByRole('button',{name:'切换旋转'}).click()
  if (isDocs) await expect(spin.locator('.i-mdi-loading')).toHaveCSS('animation-name','none')
  else await expect(star).toHaveCSS('animation-name','spin')
  await page.screenshot({path:`test-results/c01/${info.project.name}-icon.png`,fullPage:true,animations:'disabled'})
})
