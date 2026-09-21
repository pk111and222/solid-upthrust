import { test,expect,type Page,type TestInfo,type Locator } from '@playwright/test'
const path='components/data-entry/switch/'
async function demo(page:Page,info:TestInfo,id:string){await page.goto(info.project.name==='docs'?path:'Switch');return page.locator(info.project.name==='docs'?`[data-demo="switch/${id}"]`:`[data-switch-demo="${id}"]`)}
async function geometry(input:Locator,size:number,rtl=false){
 const handle=input.locator(':scope > span').last();await expect(handle).toHaveCSS('width',`${size}px`)
 await expect.poll(async()=>{const track=(await input.boundingBox())!,knob=(await handle.boundingBox())!;return Math.abs((rtl?knob.x-track.x:track.x+track.width-knob.x-knob.width)-2)}).toBeLessThan(0.6)
}
// 鼠标、Enter、Space 每次只产生一次点击和状态变化，不触发表单默认提交。
test('[switch.browser.keyboard] native click enter and space',async({page},info)=>{
 const area=await demo(page,info,'controlled'),input=area.getByRole('switch',{name:'启用提醒'})
 await input.click();await expect(area.locator('output')).toHaveText('状态：开启；点击：1')
 await input.press('Enter');await expect(area.locator('output')).toHaveText('状态：关闭；点击：2')
 await input.press('Space');await expect(area.locator('output')).toHaveText('状态：开启；点击：3');await expect(input).not.toHaveCSS('box-shadow','none')
})
// 小中大三种 size 及 RTL 的开启滑块均与右端/逻辑末端保持 2px 间距。
test('[switch.browser.geometry] size content and RTL',async({page},info)=>{
 const area=await demo(page,info,'sizes'),small=area.getByRole('switch',{name:'小号'}),middle=area.getByRole('switch',{name:'中号',exact:true}),large=area.getByRole('switch',{name:'large 映射中号'}),rtl=area.getByRole('switch',{name:'从右向左'})
 await expect(small).toHaveCSS('height','16px');await expect(middle).toHaveCSS('height','22px');await expect(large).toHaveCSS('height','22px')
 await geometry(small,12);await geometry(middle,16);await geometry(large,16);await geometry(rtl,12,true)
 const text=small.getByText('开',{exact:true}),knob=small.locator(':scope > span').last();const t=(await text.boundingBox())!,k=(await knob.boundingBox())!;expect(t.x+t.width).toBeLessThanOrEqual(k.x)
 await small.click();await expect(small).toHaveAttribute('aria-checked','false');await expect.poll(async()=>{const b=(await small.boundingBox())!,h=(await knob.boundingBox())!;return Math.abs(h.x-b.x-2)}).toBeLessThan(0.6)
 await area.screenshot({path:info.outputPath('sizes.png')})
})
// loading 图标有实际尺寸及旋转动画；loading 拦截状态但报告点击，disabled 不变色。
test('[switch.browser.loading] spinner gates and disabled color',async({page},info)=>{
 const area=await demo(page,info,'states'),input=area.getByRole('switch',{name:'加载开关',exact:true}),disabled=area.getByRole('switch',{name:'禁用开启'})
 const icon=input.locator('.i-mdi-loading');await expect(icon).not.toHaveCSS('mask-image','none');const box=(await icon.boundingBox())!;expect(box.width).toBeGreaterThan(0);expect(box.height).toBeGreaterThan(0);await expect(icon).not.toHaveCSS('animation-name','none')
 await input.scrollIntoViewIfNeeded();const loadingBox=(await input.boundingBox())!;await page.mouse.click(loadingBox.x+loadingBox.width/2,loadingBox.y+loadingBox.height/2);await input.press('Space');await expect(input).toHaveAttribute('aria-checked','true');await expect(area.locator('output')).toHaveText('点击尝试：2');await expect(input).toHaveAttribute('aria-busy','true')
 const color=await disabled.evaluate(el=>getComputedStyle(el).backgroundColor);await disabled.hover();await expect(disabled).toHaveCSS('background-color',color);await expect(disabled).toBeDisabled()
 await area.getByRole('button',{name:'切换加载状态'}).click();await expect(icon).toHaveCount(0);await input.click();await expect(input).toHaveAttribute('aria-checked','false')
 await area.screenshot({path:info.outputPath('states.png')})
})
// value 别名正常切换，ref 聚焦不改变状态，再按空格才切换。
test('[switch.browser.ref] aliases style and focus',async({page},info)=>{
 const area=await demo(page,info,'aliases-ref'),input=area.getByRole('switch',{name:'value 别名'})
 await expect(input).toHaveCSS('min-width','60px');await expect(input).toHaveAttribute('name','notification');await expect(area.getByRole('switch',{name:'默认别名'})).toHaveAttribute('aria-checked','true')
 await area.getByRole('button',{name:'聚焦别名开关'}).click();await expect(input).toBeFocused();await expect(input).toHaveAttribute('aria-checked','false');await page.keyboard.press('Space');await expect(input).toHaveAttribute('aria-checked','true')
 await area.getByRole('button',{name:'挂载或卸载 autofocus 开关'}).click();await expect(area.getByRole('switch',{name:'自动聚焦示例'})).toHaveAttribute('autofocus','');await area.getByRole('button',{name:'挂载或卸载 autofocus 开关'}).click();await expect(area.getByRole('switch',{name:'自动聚焦示例'})).toHaveCount(0)
})
// Form 真实接收布尔值；原生开关按钮操作不提交表单。
test('[switch.browser.form] boolean submission',async({page},info)=>{
 const area=await demo(page,info,'context');await expect(area.getByRole('switch',{name:'全局禁用'})).toBeDisabled();await expect(area.getByRole('switch',{name:'显式启用'})).toBeEnabled()
 const input=area.getByRole('switch',{name:'接收通知'});await input.press('Enter');await expect(input).toHaveAttribute('aria-checked','true');await expect(area.locator('output')).toHaveText('尚未提交')
 await area.getByRole('button',{name:'提交开关'}).click();await expect(area.locator('output')).toHaveText('{"enabled":true}')
})
// 开发模式也必须生成小尺寸定位和 loading 图标，零文案不能消失。
test('[switch.browser.dev] development geometry and content',async({page})=>{
 await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE??'/'}${path}`)
 await geometry(page.locator('[data-demo="switch/sizes"]').getByRole('switch',{name:'小号'}),12)
 await expect(page.locator('[data-demo="switch/basic"]').getByRole('switch',{name:'0',exact:true})).toBeVisible()
 await expect(page.locator('[data-demo="switch/states"] .i-mdi-loading').first()).not.toHaveCSS('mask-image','none')
})
// 原始静态 HTML 含 API 和同文件源码，不依赖客户端生成正文。
test('[switch.browser.ssr] API and source',async({request})=>{const response=await request.get(path);expect(response.ok()).toBe(true);const html=await response.text();expect(html).toContain('SwitchProps API');expect(html).toContain('switch/aliases-ref');expect(html).toContain('defaultValue')})
