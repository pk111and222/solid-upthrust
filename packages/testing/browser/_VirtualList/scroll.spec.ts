import { expect, test } from '@playwright/test'
// 真实布局下检查窗口上限、活跃项可见、滚动和模式切换。
test('[virtual-list.browser.scroll] 长列表定位与缩减', async ({page}, info) => {
  await page.goto('_VirtualList')
  const demo = page.locator('[data-appid="content"]')
  const viewport = demo.getByRole('list')
  await expect(demo.getByRole('listitem')).toHaveCount(8)
  await demo.getByRole('button',{name:'定位第 501 项'}).click()
  await expect(demo.getByText('项目 500',{exact:true})).toBeInViewport()
  expect(await viewport.evaluate(el => el.scrollTop)).toBe(15872)
  await viewport.evaluate(el => { el.scrollTop=3200; el.dispatchEvent(new Event('scroll')) })
  await expect(demo.getByText('项目 100',{exact:true})).toBeInViewport()
  await demo.getByRole('button',{name:'切换数据量'}).click()
  await expect(demo.getByRole('listitem')).toHaveCount(2)
  expect(await viewport.evaluate(el => el.scrollTop)).toBe(0)
  await demo.getByRole('button',{name:'切换虚拟化'}).click()
  await expect(viewport).toHaveAttribute('data-virtual-list','false')
  await page.screenshot({path:`test-results/c01/${info.project.name}-virtual-list.png`,fullPage:true,animations:'disabled'})
})
