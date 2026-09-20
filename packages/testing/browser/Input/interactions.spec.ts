import { test, expect, type Page, type TestInfo, type Locator } from '@playwright/test'
const path = 'components/data-entry/input/'
async function demo(page: Page, info: TestInfo, id: string) {
  await page.goto(info.project.name === 'docs' ? path : 'Input')
  return page.locator(info.project.name === 'docs' ? `[data-demo="input/${id}"]` : `[data-input-demo="${id}"]`)
}
// 图标进入 Button 内容包装后也必须有真实尺寸、遮罩和居中的位置。
async function expectSearchIcon(area: Locator) {
 const button=area.getByRole('button',{name:'搜索',exact:true}).nth(2)
 const icon=button.locator('.i-mdi-magnify')
 await expect(icon).toBeVisible()
 await expect(icon).not.toHaveCSS('mask-image','none')
 const rect=await icon.boundingBox(), parent=await button.boundingBox()
 expect(rect!.width).toBeGreaterThanOrEqual(14);expect(rect!.height).toBeGreaterThanOrEqual(14)
 expect(Math.abs(rect!.x+rect!.width/2-parent!.x-parent!.width/2)).toBeLessThanOrEqual(1)
 expect(Math.abs(rect!.y+rect!.height/2-parent!.y-parent!.height/2)).toBeLessThanOrEqual(1)
}
// 受控键入、清空、计数和清空后回焦必须在真实浏览器成立。
test('[input.browser.controlled] value count clear focus', async ({page},info)=>{
 const area=await demo(page,info,'controlled'), input=area.getByPlaceholder('受控输入')
 await input.fill('typed'); await expect(area.locator('output')).toHaveText('当前值：typed')
 await expect(area).toContainText('5 / 20'); await area.getByRole('button',{name:'clear',exact:true}).click()
 await expect(input).toHaveValue(''); await expect(input).toBeFocused(); await expect(area.locator('output')).toHaveText('当前值：')
})
// 动态前后缀不替换原生节点，字号和三尺寸从实际 CSS 测量，不能只断言类名。
test('[input.browser.layout] stable node and sizes', async ({page},info)=>{
 let area=await demo(page,info,'affix'); const input=area.getByPlaceholder('动态前后缀'), original=await input.elementHandle()
 await area.getByRole('button',{name:'切换前后缀'}).click(); expect(await original!.evaluate(el=>el.isConnected)).toBe(true)
 await area.screenshot({ path: info.outputPath('affix.png') })
 await expect(input).toHaveValue('100'); await original!.dispose()
 area=await demo(page,info,'size-status')
 const heights=[]
 for(const name of ['小号','中号','大号']) { const box=await area.getByPlaceholder(name).boundingBox(); heights.push(box!.height) }
 expect(heights[0]).toBeLessThan(heights[1]); expect(heights[1]).toBeLessThan(heights[2])
 await expect(area.locator('input').filter({visible:true}).first()).toHaveCSS('border-top-width','1px')
})
// 密码指针与键盘切换、hover 恢复及禁用开关在真实浏览器验证。
test('[input.browser.password] visibility and hover restore',async({page},info)=>{
 const area=await demo(page,info,'password'), click=area.getByPlaceholder('点击显示密码'), hover=area.getByPlaceholder('悬停显示密码')
 await area.getByRole('button',{name:'显示密码',exact:true}).first().click(); await expect(click).toHaveAttribute('type','text')
 await area.getByRole('button',{name:'隐藏密码',exact:true}).first().press('Space'); await expect(click).toHaveAttribute('type','password')
 await area.getByRole('button',{name:'显示密码',exact:true}).nth(1).hover(); await expect(hover).toHaveAttribute('type','text')
 await click.hover(); await expect(hover).toHaveAttribute('type','password')
 await expect(area.getByPlaceholder('禁用密码')).toBeDisabled()
})
// TextArea 内容增长到 maxRows 后可滚动，宽度变化重新测量；销毁不遗留镜像。
test('[input.browser.autosize] bounded height resize cleanup',async({page},info)=>{
 const area=await demo(page,info,'autosize'), ta=area.getByPlaceholder('自动高度')
 await expect(ta).toBeVisible(); const first=(await ta.boundingBox())!.height
 await ta.fill('1\n2\n3\n4\n5\n6'); await expect.poll(async()=>(await ta.boundingBox())!.height).toBeGreaterThan(first)
 await expect(ta).toHaveCSS('overflow-y','auto')
 const dimensions=await ta.evaluate(el=>({scroll:el.scrollHeight,client:el.clientHeight}));expect(dimensions.scroll).toBeGreaterThan(dimensions.client)
 await area.screenshot({ path: info.outputPath('autosize.png') })
 await ta.fill(''); await expect.poll(async()=>(await ta.boundingBox())!.height).toBeLessThan(first+1)
 await ta.fill('一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十')
 const wide=(await ta.boundingBox())!.height
 await ta.evaluate(el=>{el.parentElement!.style.width='100px'})
 await expect.poll(async()=>(await ta.boundingBox())!.height).toBeGreaterThan(wide)
 const before=await page.locator('textarea[aria-hidden="true"]').count()
 await area.getByRole('button',{name:'挂载或卸载文本域'}).click();await expect(ta).toHaveCount(0)
 await expect(page.locator('textarea[aria-hidden="true"]')).toHaveCount(before-1)
})
// 三种搜索入口、清空来源和加载拦截不触发表单隐式提交。
test('[input.browser.search] enter click clear and loading',async({page},info)=>{
 let area=await demo(page,info,'search');await expectSearchIcon(area);await area.screenshot({path:info.outputPath('search-icons.png')});await area.getByPlaceholder('图标搜索').press('Enter');await expect(area.locator('output')).toHaveText('结果：input:query')
 await area.getByRole('button',{name:'clear',exact:true}).click();await expect(area.locator('output')).toHaveText('结果：clear:')
 await area.getByPlaceholder('文字按钮搜索').fill('word');await area.getByRole('button',{name:'搜索',exact:true}).nth(1).click();await expect(area.locator('output')).toHaveText('结果：input:word')
 area=await demo(page,info,'search-loading');await area.getByPlaceholder('加载期间不搜索').press('Enter');await expect(area.locator('output')).toHaveText('搜索次数：0')
 await area.getByRole('button',{name:'切换加载'}).click();await area.getByPlaceholder('加载期间不搜索').press('Enter');await expect(area.locator('output')).toHaveText('搜索次数：1')
})
// 真实 Form.Item 字段值传入 Search，编辑后搜索读取最新值。
test('[input.browser.form] form field injection',async({page},info)=>{
 const area=await demo(page,info,'context'), input=area.locator('input').nth(1)
 await expect(input).toHaveValue('字段搜索');await input.fill('字段更新');await input.press('Enter');await expect(area.locator('output')).toHaveText('搜索字段：字段更新')
})
// 合成标准输入法事件序列，确认组合期间不搜索、结束后正常 Enter；不冒充 OS 输入法端到端。
test('[input.browser.ime] composition sequence then Enter',async({page},info)=>{
 const area=await demo(page,info,'search'), input=area.getByPlaceholder('图标搜索')
 await input.evaluate(el=>{
  el.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}))
  ;(el as HTMLInputElement).value='中文';el.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true}))
  el.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Enter',isComposing:true}))
  el.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}))
  el.dispatchEvent(new InputEvent('input',{bubbles:true}))
 })
 await expect(area.locator('output')).toHaveText('结果：未搜索');await expect(input).toHaveValue('中文')
 await input.press('Enter');await expect(area.locator('output')).toHaveText('结果：input:中文')
})
// 开发模式额外核验边框绘制和可聚焦的搜索按钮。
test('[input.browser.dev] development painting',async({page})=>{
 await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE??'/'}${path}`)
 const area=page.locator('[data-demo="input/search"]'), input=area.getByPlaceholder('图标搜索')
 await expectSearchIcon(area)
 await expect(input).toBeVisible();await expect(input.locator('..')).toHaveCSS('border-top-width','1px')
 await area.getByRole('button',{name:'搜索',exact:true}).first().focus();await page.keyboard.press('Enter');await expect(area.locator('output')).toHaveText('结果：input:query')
})
// 文本域固定行数、计数与清空操作在实际布局中保持可用。
test('[input.browser.textarea] count clear and fixed rows',async({page},info)=>{
 const area=await demo(page,info,'textarea'), ta=area.getByPlaceholder('填写备注')
 await expect(ta).toHaveJSProperty('rows',4)
 await ta.fill('第一行\n第二行');await expect(area).toContainText('7 / 100')
 // 计数必须位于编辑区下方，不能覆盖最后一行文本或缩放手柄。
 const count=(await area.getByText('7 / 100',{exact:true}).boundingBox())!, box=(await ta.boundingBox())!
 expect(count.y).toBeGreaterThanOrEqual(box.y+box.height)
 await area.screenshot({path:info.outputPath('textarea.png')})
 await area.getByRole('button',{name:'clear',exact:true}).click();await expect(ta).toHaveValue('');await expect(ta).toBeFocused()
})
