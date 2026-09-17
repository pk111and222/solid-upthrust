import { expect, test } from '@playwright/test'
// 独立示例验证主题绘制、禁用优先级与弹层作用域。
test('[config-provider.browser.theme] 主题与默认属性切换', async ({page}, info) => {
  const isDocs = info.project.name === 'docs'
  await page.goto(isDocs ? 'components/general/config-provider/' : 'ConfigProvider')
  const content = page.locator(isDocs ? '#main-content' : '[data-appid="content"]')
  const theme = isDocs ? content.locator('[data-demo="config-provider/theme"]') : content
  const button = theme.getByRole('button',{name:isDocs ? '品牌按钮' : '继承默认值',exact:true})
  await expect(button).toBeVisible()
  const before = await button.evaluate(el => getComputedStyle(el).backgroundColor)
  await theme.locator('label').filter({hasText:'紫色品牌'}).getByRole('switch').click()
  await expect.poll(() => button.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(before)
  const disabled = isDocs ? content.locator('[data-demo="config-provider/disabled"]') : content
  await disabled.locator('label').filter({hasText:'默认禁用'}).getByRole('switch').click()
  await expect(disabled.getByRole('button',{name:'继承默认值',exact:true})).toBeDisabled()
  await expect(disabled.getByRole('button',{name:'显式属性优先'})).toBeEnabled()
  const portal = isDocs ? content.locator('[data-demo="config-provider/portal"]') : content
  await portal.getByRole('button',{name:'打开局部 Modal'}).click()
  const dialog = portal.getByRole('dialog')
  await expect(dialog).toBeVisible()
  expect(await dialog.evaluate(el => !!el.closest('[data-upthrust-config]'))).toBe(true)
  await page.screenshot({path:`test-results/c01/${info.project.name}-config-provider.png`,fullPage:true,animations:'disabled'})
})
