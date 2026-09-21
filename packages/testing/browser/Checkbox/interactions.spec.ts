import { test, expect, type Page, type TestInfo, type Locator } from '@playwright/test'
const path = 'components/data-entry/checkbox/'
async function demo(page: Page, info: TestInfo, id: string) {
 await page.goto(info.project.name === 'docs' ? path : 'Checkbox')
 return page.locator(info.project.name === 'docs' ? `[data-demo="checkbox/${id}"]` : `[data-checkbox-demo="${id}"]`)
}
async function painting(area: Locator) {
 const checkbox = area.getByRole('checkbox', { name: '接受协议', exact: true })
 const box = checkbox.locator('+ span')
 await expect(box).toHaveCSS('width', '16px'); await expect(box).toHaveCSS('height', '16px'); await expect(box).toHaveCSS('border-top-width', '1px')
 await checkbox.focus(); await checkbox.press('Space'); await expect(checkbox).toBeChecked()
 await expect(box).not.toHaveCSS('box-shadow', 'none')
 const mark=box.locator('span'); await expect(mark).toHaveCSS('display','block'); await expect(mark).not.toHaveCSS('mask-image','none')
 const rect=await mark.boundingBox(); expect(rect!.width).toBeGreaterThan(0); expect(rect!.height).toBeGreaterThan(0)
 await expect(mark).toHaveCSS('opacity','1')
 const mixed=area.getByRole('checkbox',{name:'半选',exact:true}); await expect(mixed).toHaveJSProperty('indeterminate',true)
 await mixed.press('Space'); await expect(mixed).toHaveJSProperty('indeterminate',true)
 await expect(area.getByRole('checkbox',{name:'禁用已选',exact:true})).toBeDisabled()
 await expect(area.getByRole('checkbox',{name:'禁用未选',exact:true})).not.toBeChecked()
}
// 实际绘制检查尺寸、勾选图标遮罩、键盘焦点环和半选激活后的原生属性。
test('[checkbox.browser.paint] keyboard and state painting', async({page},info)=>{
 const area=await demo(page,info,'basic'); await painting(area); await area.screenshot({path:info.outputPath('states.png')})
})
// 鼠标和文字标签切换受控状态；空格激活聚焦按钮后仅移动焦点，再按空格才切换。
test('[checkbox.browser.controlled] label click and ref keyboard sequence',async({page},info)=>{
 const area=await demo(page,info,'controlled'), input=area.getByRole('checkbox',{name:'受控同意'})
 await input.click(); await expect(input).toBeChecked(); await expect(area.locator('output')).toHaveText('当前状态：已勾选')
 await input.locator('..').click(); await expect(input).not.toBeChecked()
 const button=area.getByRole('button',{name:'聚焦复选框'})
 await button.click(); await expect(input).toBeFocused(); await expect(input).not.toBeChecked()
 await input.press('Tab'); await expect(button).toBeFocused(); await page.keyboard.press('Space')
 await expect(input).toBeFocused(); await expect(input).not.toBeChecked()
 await page.keyboard.press('Space'); await expect(input).toBeChecked(); await expect(area.locator('output')).toHaveText('当前状态：已勾选')
})
// 确认型受控示例必须有请求反馈、确认和取消入口，未确认时维持原状态。
test('[checkbox.browser.confirmation] visible request confirm and cancel',async({page},info)=>{
 const area=await demo(page,info,'confirmation'), input=area.getByRole('checkbox',{name:'需确认的选项'})
 const confirm=area.getByRole('button',{name:'确认变更'}), cancel=area.getByRole('button',{name:'取消变更'})
 await expect(confirm).toBeDisabled(); await input.click(); await expect(input).not.toBeChecked()
 await expect(area.locator('output')).toHaveText('已收到勾选请求，请确认或取消变更。')
 await cancel.click(); await expect(input).not.toBeChecked(); await expect(confirm).toBeDisabled()
 await input.click(); await confirm.click(); await expect(input).toBeChecked(); await expect(area.locator('output')).toHaveText('当前状态：已勾选')
 await input.press('Space'); await expect(input).toBeChecked(); await expect(area.locator('output')).toHaveText('已收到取消勾选请求，请确认或取消变更。')
 await confirm.click(); await expect(input).not.toBeChecked(); await expect(area.locator('output')).toHaveText('当前状态：未勾选')
})
// 全选从半选进入全选和清空；动态整组禁用后鼠标、键盘均不改变选择。
test('[checkbox.browser.group] select all disabled and names',async({page},info)=>{
 const area=await demo(page,info,'group'), all=area.getByRole('checkbox',{name:'全选水果'})
 await expect(all).toHaveJSProperty('indeterminate',true); await all.click(); await expect(area.locator('output')).toHaveText('选择：apple,banana')
 await all.click(); await expect(area.locator('output')).toHaveText('选择：')
 await area.getByRole('checkbox',{name:'苹果',exact:true}).click(); await expect(all).toHaveJSProperty('indeterminate',true)
 await expect(area.getByRole('checkbox',{name:'苹果',exact:true})).toHaveAttribute('name','fruits')
 await area.getByRole('button',{name:'切换组禁用'}).click()
 for (const input of await area.getByRole('checkbox').all()) await expect(input).toBeDisabled()
 await area.getByRole('button',{name:'切换组禁用'}).click(); await expect(all).toBeEnabled(); await expect(area.getByRole('checkbox',{name:'樱桃',exact:true})).toBeDisabled()
})
// 自定义子项名称、数字字符串隔离以及 skipGroup 不影响其他值。
test('[checkbox.browser.children] independent values and opt out',async({page},info)=>{
 const area=await demo(page,info,'children'), numeric=area.getByRole('checkbox',{name:'数字零'}), string=area.getByRole('checkbox',{name:'字符串零'})
 await expect(numeric).toBeChecked(); await expect(string).not.toBeChecked(); await string.click(); await expect(numeric).toBeChecked(); await expect(string).toBeChecked()
 const solo=area.getByRole('checkbox',{name:'独立开关'}); await solo.click(); await expect(solo).toBeChecked(); await expect(solo).toHaveAttribute('name','independent')
 await expect(area.getByRole('checkbox',{name:'锁定项'})).toBeDisabled()
})
// 真实 Form 写入布尔与数组字段，显式 false 覆盖全局禁用并可提交。
test('[checkbox.browser.form] boolean and group field submission',async({page},info)=>{
 const area=await demo(page,info,'context')
 await expect(area.getByRole('checkbox',{name:'全局禁用'})).toBeDisabled(); await expect(area.getByRole('checkbox',{name:'显式启用'})).toBeEnabled()
 await area.getByRole('checkbox',{name:'接受条款'}).click(); await area.getByRole('checkbox',{name:'设计',exact:true}).click()
 await area.getByRole('button',{name:'提交选项'}).click(); await expect(area.locator('output')).toHaveText('{"agree":false,"tools":["code","design"]}')
})
// 开发服务也必须生成焦点、边框、图标样式。
test('[checkbox.browser.dev] development painting',async({page})=>{
 await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE??'/'}${path}`)
 await painting(page.locator('[data-demo="checkbox/basic"]'))
})
// 原始 SSR 响应含独立组 API 与演示源代码，深链接可直达。
test('[checkbox.browser.ssr] source and group API',async({request})=>{
 const response=await request.get(path); expect(response.ok()).toBe(true); const html=await response.text()
 expect(html).toContain('CheckboxGroupProps API'); expect(html).toContain('checkbox/children'); expect(html).toContain('defaultChecked')
})
