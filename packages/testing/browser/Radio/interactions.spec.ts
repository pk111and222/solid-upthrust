import { test, expect, type Page, type TestInfo, type Locator } from '@playwright/test'
const path = 'components/data-entry/radio/'
async function demo(page: Page, info: TestInfo, id: string) {
 await page.goto(info.project.name === 'docs' ? path : 'Radio')
 return page.locator(info.project.name === 'docs' ? `[data-demo="radio/${id}"]` : `[data-radio-demo="${id}"]`)
}
async function paint(area: Locator) {
 const input=area.getByRole('radio',{name:'独立选项',exact:true}), dot=input.locator('+ span')
 await expect(dot).toHaveCSS('width','16px');await expect(dot).toHaveCSS('height','16px');await expect(dot).toHaveCSS('border-top-width','1px')
 await input.focus();await input.press('Space');await expect(input).toBeChecked();await expect(dot).not.toHaveCSS('box-shadow','none')
 await expect(dot.locator('span')).toHaveCSS('width','8px');await expect(dot.locator('span')).toHaveCSS('height','8px');await expect(dot.locator('span')).toHaveCSS('opacity','1')
 await input.click();await expect(input).toBeChecked()
 await expect(area.getByRole('radio',{name:'禁用未选'})).toBeDisabled();await expect(area.getByRole('radio',{name:'禁用已选'})).toBeChecked()
}
// 原生输入空间键选择、圆点尺寸、边框和可见焦点环在生产绘制中成立。
test('[radio.browser.paint] native semantics and dot painting',async({page},info)=>{
 const area=await demo(page,info,'basic');await paint(area);await area.screenshot({path:info.outputPath('states.png')})
 await area.getByRole('button',{name:'聚焦独立选项'}).click();await expect(area.getByRole('radio',{name:'独立选项',exact:true})).toBeFocused()
})
// 原生组的方向键应切换并跳过禁用项，支持首尾循环和一个 Tab 停靠点。
test('[radio.browser.keyboard] arrow skip wrap and tab exit',async({page},info)=>{
 const area=await demo(page,info,'group'), apple=area.getByRole('radio',{name:'苹果',exact:true}), banana=area.getByRole('radio',{name:'香蕉',exact:true}), orange=area.getByRole('radio',{name:'橙子',exact:true})
 await apple.focus();await page.keyboard.press('ArrowRight');await expect(banana).toBeFocused();await expect(banana).toBeChecked();await expect(apple).not.toBeChecked()
 await page.keyboard.press('ArrowDown');await expect(orange).toBeFocused();await expect(orange).toBeChecked()
 await page.keyboard.press('ArrowRight');await expect(apple).toBeFocused();await expect(apple).toBeChecked();await expect(area.locator('output')).toHaveText('选择：apple')
 await page.keyboard.press('ArrowLeft');await expect(orange).toBeChecked();await page.keyboard.press('Tab');await expect(orange).not.toBeFocused();await expect(banana).not.toBeFocused()
})
// 父层拒绝时原生旧项也必须恢复；确认后保持单选，取消则保留原值。
test('[radio.browser.controlled] request confirm and cancel',async({page},info)=>{
 const area=await demo(page,info,'controlled'), standard=area.getByRole('radio',{name:'标准方案'}), advanced=area.getByRole('radio',{name:'高级方案'})
 await advanced.click();await expect(advanced).not.toBeChecked();await expect(standard).toBeChecked();await expect(area.locator('output')).toHaveText('待确认：advanced')
 await area.getByRole('button',{name:'取消请求'}).click();await expect(standard).toBeChecked()
 await standard.focus();await page.keyboard.press('ArrowRight');await expect(standard).toBeChecked();await expect(advanced).not.toBeChecked()
 await area.getByRole('button',{name:'确认选择'}).click();await expect(advanced).toBeChecked();await expect(standard).not.toBeChecked();await expect(area.locator('output')).toHaveText('当前：advanced')
})
// 默认无 name 的组仍支持键盘；外观切换保留值，动态禁用阻止所有选项，skipGroup 独立。
test('[radio.browser.dynamic] auto name appearance and opt out',async({page},info)=>{
 const area=await demo(page,info,'dynamic'), zero=area.getByRole('radio',{name:'数字零'}), string=area.getByRole('radio',{name:'字符串零'})
 await zero.focus();await page.keyboard.press('ArrowRight');await expect(string).toBeChecked();await expect(string).toBeFocused()
 await area.getByRole('button',{name:'切换外观'}).click();await expect(string).toBeChecked();await expect(zero).not.toBeChecked()
 await area.getByRole('button',{name:'切换禁用'}).click();await expect(zero).toBeDisabled();await expect(string).toBeDisabled()
 const outside=area.getByRole('radio',{name:'独立于组'});await outside.click();await expect(outside).toBeChecked();await expect(area.getByRole('radio',{name:'组内',exact:true})).toBeChecked()
 await area.getByRole('button',{name:'切换禁用'}).click();await expect(string).toBeEnabled();await expect(string).toBeChecked()
})
// 按钮条的圆角、边框、相邻拼接和键盘焦点须实际绘制，单个选项左右均圆角。
test('[radio.browser.buttons] joined geometry focus and single corners',async({page},info)=>{
 const area=await demo(page,info,'buttons'), beijing=area.getByRole('radio',{name:'北京',exact:true}), shanghai=area.getByRole('radio',{name:'上海',exact:true}), shenzhen=area.getByRole('radio',{name:'深圳',exact:true})
 await shanghai.focus();await page.keyboard.press('ArrowRight');await expect(shenzhen).toBeFocused();await expect(shenzhen).toBeChecked()
 const label=shenzhen.locator('..');await expect(label).not.toHaveCSS('box-shadow','none');await expect(label).toHaveCSS('border-top-width','1px')
 const first=(await beijing.locator('..').boundingBox())!,second=(await shanghai.locator('..').boundingBox())!
 expect(Math.abs(first.x+first.width-second.x)).toBeLessThanOrEqual(1.1);expect(first.height).toBeGreaterThanOrEqual(30)
 const solo=area.getByRole('radio',{name:'唯一选项'}).locator('..')
 for(const corner of ['border-top-left-radius','border-top-right-radius']) await expect(solo).not.toHaveCSS(corner,'0px')
 const disabledA=area.getByRole('radio',{name:'禁用 A'}), disabledB=area.getByRole('radio',{name:'禁用 B'})
 await expect(disabledA).toBeChecked();await expect(disabledB).toBeDisabled()
 const uncheckedBackground=await disabledB.locator('..').evaluate(el=>getComputedStyle(el).backgroundColor)
 await expect(disabledA.locator('..')).not.toHaveCSS('background-color',uncheckedBackground);await area.screenshot({path:info.outputPath('buttons.png')})
})
// 自定义 RadioButton 子项确实渲染，组值和子项事件各一次；独立按钮可选择。
test('[radio.browser.custom] named button component and child callback',async({page},info)=>{
 const area=await demo(page,info,'custom-buttons'), center=area.getByRole('radio',{name:'居中',exact:true})
 await center.click();await expect(center).toBeChecked();await expect(area.locator('output')).toHaveText('对齐：center；居中事件：1')
 await center.click();await expect(area.locator('output')).toHaveText('对齐：center；居中事件：1')
 await area.getByRole('radio',{name:'右对齐'}).click();await expect(center).not.toBeChecked();await area.getByRole('radio',{name:'独立按钮选项'}).click();await expect(area.getByRole('radio',{name:'独立按钮选项'})).toBeChecked()
})
// 真实 Form 提交分别得到普通组和按钮组标量，不能出现按钮项写回 true。
test('[radio.browser.form] scalar field submission',async({page},info)=>{
 const area=await demo(page,info,'context');await expect(area.getByRole('radio',{name:'全局禁用'})).toBeDisabled();await expect(area.getByRole('radio',{name:'显式启用'})).toBeEnabled()
 await area.getByRole('radio',{name:'短信',exact:true}).click();await area.getByRole('radio',{name:'上海',exact:true}).click();await area.getByRole('button',{name:'提交单选'}).click()
 await expect(area.locator('output')).toHaveText('{"channel":"sms","city":"sh"}')
})
// 开发环境必须保留与生产一致的圆点、焦点和边框样式。
test('[radio.browser.dev] development painting',async({page})=>{
 const warnings:string[]=[]
 page.on('console',message=>{if(message.text().includes('NO_OWNER_CLEANUP')) warnings.push(message.text())})
 await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE??'/'}${path}`);await paint(page.locator('[data-demo="radio/basic"]'));expect(warnings).toEqual([])
})
// 原始响应即包含全部公开子组件 API 和同文件示例源码。
test('[radio.browser.ssr] independent component API and sources',async({request})=>{
 const response=await request.get(path);expect(response.ok()).toBe(true);const html=await response.text();expect(html).toContain('RadioButtonProps API');expect(html).toContain('RadioGroupProps API');expect(html).toContain('radio/custom-buttons');expect(html).toContain('skipGroup')
})
