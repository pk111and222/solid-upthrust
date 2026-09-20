import { test, expect, type Page, type TestInfo, type Locator } from '@playwright/test'
const route = 'components/navigation/pagination/'
async function demo(page: Page, info: TestInfo, name: string) {
  await page.goto(info.project.name === 'docs' ? route : 'Pagination')
  return page.locator(info.project.name === 'docs' ? `[data-demo="pagination/${name}"]` : `[data-pagination-demo="${name}"]`)
}
async function painting(area: Locator) {
  const page = area.getByRole('button', { name: '25', exact: true })
  await expect(page).toHaveCSS('height', '32px')
  await expect(page).toHaveCSS('border-top-width', '1px')
  await expect(page).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  const ellipsis = area.locator('.i-mdi-dots-horizontal').first()
  await expect(ellipsis).toBeVisible(); await expect(ellipsis).not.toHaveCSS('mask-image', 'none')
  await expect(ellipsis).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
}
// 页码键盘激活与焦点描边、ellipsis 的真实绘制和页码切换。
test('[pagination.browser.basic] painting and keyboard', async ({page}, info) => {
  const area = await demo(page,info,'basic'); await painting(area)
  const next = area.getByRole('button',{name:'Next Page'})
  await next.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab')
  await expect(next).toBeFocused(); await expect(next).not.toHaveCSS('box-shadow','none')
  await next.press('Enter'); await expect(area.locator('[aria-current]')).toHaveText('26')
  await expect(area).toContainText('251-260 / 500')
})
// 容量菜单在真实布局中可见、键盘选择后回焦，并更新双受控状态。
test('[pagination.browser.size] dropdown keyboard and controlled state', async ({page}, info) => {
  const area = await demo(page,info,'controlled'), trigger = area.getByRole('button',{name:'10 条/页'})
  await trigger.focus(); await trigger.press('ArrowDown')
  const menu = page.getByRole('menu').filter({ has: page.getByRole('menuitem', { name: '10 条/页', exact: true }) }); await expect(menu).toBeVisible()
  await expect(menu.getByRole('menuitem', {name:'10 条/页',exact:true})).toBeFocused()
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter')
  await expect(area.locator('output')).toHaveText('当前 3 页，每页 20 条')
  await expect(menu).toBeHidden(); await expect(area.getByRole('button',{name:'20 条/页'})).toBeFocused()
  await area.screenshot({path:info.outputPath('controlled.png')})
})
// 表单中所有分页操作不隐式提交，非法跳页不改变页码。
test('[pagination.browser.form] jumper and non-submit buttons', async ({page}, info) => {
  const area = await demo(page,info,'jumper'), input = area.getByRole('textbox',{name:'跳转页码'})
  await input.fill('2x'); await input.press('Enter'); await expect(area.locator('[aria-current]')).toHaveText('1')
  await input.fill('8'); await input.press('Enter'); await expect(area.locator('[aria-current]')).toHaveText('8')
  await expect(input).toHaveValue(''); await area.getByRole('button',{name:'Next Page'}).press('Space')
  await expect(area.locator('[aria-current]')).toHaveText('9'); await expect(area.locator('output')).toHaveText('提交次数：0')
})
// 三种对齐以几何位置验证，两种尺寸以真实高度验证。
test('[pagination.browser.layout] dimensions and alignment', async ({page}, info) => {
  const area = await demo(page,info,'appearance'), navs = area.getByRole('navigation',{name:'分页'})
  for (let i=0;i<3;i++) {
    const nav=navs.nth(i), buttons=nav.getByRole('button'), rect=(await nav.boundingBox())!
    const first=(await buttons.first().boundingBox())!, last=(await buttons.last().boundingBox())!
    expect(first.height).toBe(i===1?24:32)
    if(i===0) expect(Math.abs(first.x-rect.x)).toBeLessThan(2)
    if(i===1) expect(Math.abs((first.x+last.x+last.width)/2-(rect.x+rect.width/2))).toBeLessThan(2)
    if(i===2) expect(Math.abs(last.x+last.width-(rect.x+rect.width-4))).toBeLessThan(2)
  }
})
// 动态总数触发页码夹紧和隐藏，禁用时容量入口保留且可重新启用。
test('[pagination.browser.dynamic] total and disabled', async ({page}, info) => {
  let area=await demo(page,info,'dynamic')
  await area.getByRole('button',{name:'切换总数'}).click()
  await expect(area.getByRole('navigation',{name:'分页'})).toHaveCount(1)
  await expect(area).toContainText('1-5 / 5'); await expect(area.locator('[aria-current]')).toHaveText('1')
  area=await demo(page,info,'disabled')
  await expect(area.getByRole('button',{name:'10 条/页'})).toBeDisabled()
  await area.getByRole('button',{name:'切换禁用'}).click()
  await area.getByRole('button',{name:'10 条/页'}).click(); await expect(page.getByRole('menu').filter({ has: page.getByRole('menuitem', { name: '10 条/页', exact: true }) })).toBeVisible()
  await expect(page.getByRole('menuitem',{name:'10 条/页',exact:true})).toBeFocused()
  await page.keyboard.press('Escape'); await expect(page.getByRole('menu').filter({ has: page.getByRole('menuitem', { name: '10 条/页', exact: true }) })).toBeHidden()
})
// Headless 切片集成验证真实示例，避免以内部状态代替用户看到的数据。
test('[pagination.browser.slice] headless integration', async ({page}, info) => {
  const area=await demo(page,info,'slice')
  await area.getByRole('button',{name:'Next Page'}).click()
  await expect(area.locator('li')).toHaveText(['记录 6','记录 7','记录 8','记录 9','记录 10'])
})
// 开发环境挂载和 CSS 提取也应包含边框、尺寸与省略号。
test('[pagination.browser.dev] development painting', async ({page}) => {
  await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE??'/'}${route}`)
  await painting(page.locator('[data-demo="pagination/basic"]'))
})
