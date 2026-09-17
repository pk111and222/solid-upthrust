import { expect, test } from '@playwright/test'
// 公开路由不包含内部物料，旧链接返回真实 404。
test('[docs.public.routes] 内部组件不出现在文档', async ({request}) => {
  const manifest = await (await request.get('routes.json')).json()
  expect(manifest.routes.some((route: {path:string}) => route.path.includes('/internal/'))).toBe(false)
  expect((await request.get('components/internal/virtual-list/')).status()).toBe(404)
})
// 全宽布局、自举菜单与 Table 在无 JS 的 HTML 中仍然可导航和阅读。
test('[docs.design.ssr] 全屏框架与自举 API 表格', async ({browser,baseURL}) => {
  const context = await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:1600,height:1000}})
  try {
    const page = await context.newPage()
    await page.goto('components/general/icon/')
    const main = page.locator('main')
    expect((await main.boundingBox())!.width).toBeGreaterThan(1300)
    await expect(page.getByRole('navigation',{name:'文档目录',exact:true}).getByRole('link',{name:'Icon 图标'})).toHaveAttribute('aria-current','page')
    await expect(page.locator('[data-api-table] table')).toHaveCount(1)
    await expect(page.locator('[data-api-table]')).toContainText('onClick')
    const sections = page.locator('[data-demo-section]')
    await expect(sections).toHaveCount(6)
    await expect(sections.locator('details[open]')).toHaveCount(0)
    await sections.first().locator('summary').click()
    await expect(sections.first().locator('pre')).toBeVisible()
    await expect(sections.first().locator('code')).not.toContainText('createSignal')
  } finally {await context.close()}
})
// 每个演示只控制自己的代码面板；窄屏不产生页面级横向溢出。
test('[docs.design.responsive] 独立代码区与移动目录', async ({page}) => {
  await page.goto('components/general/config-provider/')
  const sections = page.locator('[data-demo-section]')
  await expect(sections).toHaveCount(9)
  await sections.first().locator('summary').click()
  await expect(sections.locator('details[open]')).toHaveCount(1)
  await expect(sections.first().locator('pre')).toContainText('components=')
  await page.context().grantPermissions(['clipboard-read','clipboard-write'])
  await sections.first().getByRole('button',{name:'复制代码'}).click()
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('export default function Basic')
  await page.evaluate(() => window.scrollTo(0,0))
  await page.screenshot({path:'test-results/docs/config-provider-desktop.png',fullPage:true,animations:'disabled'})
  await page.setViewportSize({width:390,height:844})
  await page.reload()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  const mobile = page.getByRole('navigation',{name:'移动文档目录'})
  await expect(mobile).not.toBeVisible()
  await page.locator('summary').filter({hasText:'文档目录'}).click()
  await expect(mobile).toBeVisible()
  await mobile.getByRole('link',{name:'Icon 图标'}).click()
  await expect(page.locator('h1')).toHaveText('Icon 图标')
  await page.screenshot({path:'test-results/docs/icon-mobile.png',fullPage:true,animations:'disabled'})
})
// 菜单跳转保留页面壳和文档实例，正确销毁旧示例，并支持前进后退。
test('[docs.navigation.persist] 菜单切换不整页刷新', async ({page}) => {
  await page.goto('components/general/icon/')
  await expect(page.locator('[data-demo="icon/action"]')).toHaveAttribute('data-demo-state','ready')
  const marker = await page.evaluate(() => {
    const token = String(Math.random())
    document.documentElement.dataset.navigationMarker = token
    document.querySelector('header')!.dataset.preserved = token
    return token
  })
  const menu = page.getByRole('navigation',{name:'文档目录',exact:true})
  await menu.getByRole('link',{name:'ConfigProvider 全局配置'}).click()
  await expect(page.locator('h1')).toHaveText('ConfigProvider 全局配置')
  await expect(page.locator('html')).toHaveAttribute('data-navigation-marker',marker)
  await expect(page.locator('header')).toHaveAttribute('data-preserved',marker)
  await expect(menu.getByRole('link',{name:'ConfigProvider 全局配置'})).toHaveAttribute('aria-current','page')
  await expect(page.locator('[data-demo="config-provider/fragment"] > div > button')).toHaveCount(2)
  await page.goBack()
  await expect(page.locator('h1')).toHaveText('Icon 图标')
  await expect(page.locator('[data-demo="icon/action"] output')).toHaveText('收藏次数：0')
  await expect(page.locator('html')).toHaveAttribute('data-navigation-marker',marker)
  await page.goForward()
  await expect(page.locator('h1')).toHaveText('ConfigProvider 全局配置')
  await page.reload()
  await expect(page.locator('h1')).toHaveText('ConfigProvider 全局配置')
})
