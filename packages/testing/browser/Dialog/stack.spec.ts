import { test, expect } from '@playwright/test'

// B05 叠层：抽屉内打开 Modal——Modal 在上层；Escape 逐层关闭；滚动锁在全部关闭后才解除；焦点逐层回退。
test('[dialog.browser.stack] drawer + modal stacking, Escape order and scroll lock', async ({ page }, info) => {
  test.skip(info.project.name === 'docs', '使用 example 的多层页面')
  await page.goto('Drawer')
  const trigger = page.locator('[data-drawer-demo="multi-level"]').getByRole('button').first()
  await trigger.click()
  const first = page.getByRole('dialog').first()
  await expect(first).toBeVisible()
  const inner = first.getByRole('button', { name: '打开第二层' })
  await inner.click()
  await expect(page.getByRole('dialog')).toHaveCount(2)
  expect(await page.evaluate(() => [document.body.style.overflow, document.body.dataset.utDialogLock])).toEqual(['hidden', '2'])
  // 焦点被锁在最上层：Tab 不会落到下层。
  for (let i = 0; i < 3; i++) await page.keyboard.press('Tab')
  expect(await page.getByRole('dialog').nth(1).evaluate(el => el.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(1)
  await expect(inner).toBeFocused()
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect.poll(() => page.evaluate(() => [document.body.style.overflow, document.body.dataset.utDialogLock ?? null])).toEqual(['', null])
})
