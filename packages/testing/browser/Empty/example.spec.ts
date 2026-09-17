import { test, expect } from '@playwright/test'
// 简洁插画使用组件实例；两个示例的 SVG 均渲染，添加数据后移除对应空态。
test('[empty.example.image] 简洁插画及空态切换', async ({page}) => {
  await page.goto('Empty')
  const content = page.locator('[data-appid="content"]')
  await expect(content.locator('svg[width="64"]')).toHaveCount(2)
  await content.getByRole('button',{name:'添加一条'}).click()
  await expect(content.getByText('第一条数据 —— Solid Signals 驱动')).toBeVisible()
  await expect(content.locator('svg[width="64"]')).toHaveCount(1)
})
