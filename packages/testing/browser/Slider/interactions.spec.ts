import { test,expect,type Page,type TestInfo,type Locator } from '@playwright/test'
const path='components/data-entry/slider/'
async function demo(page:Page,info:TestInfo,id:string){await page.goto(info.project.name==='docs'?path:'Slider');return page.locator(info.project.name==='docs'?`[data-demo="slider/${id}"]`:`[data-slider-demo="${id}"]`)}
const rail=(handle:Locator)=>handle.locator('..')
const track=(handle:Locator)=>rail(handle).locator(':scope > span').nth(1)
async function point(handle:Locator,percent:number,vertical=false){await handle.scrollIntoViewIfNeeded();const box=(await rail(handle).boundingBox())!;return {x:vertical?box.x+box.width/2:box.x+box.width*percent/100,y:vertical?box.y+box.height*(1-percent/100):box.y+box.height/2}}
async function clickAt(page:Page,handle:Locator,percent:number,vertical=false){const p=await point(handle,percent,vertical);await page.mouse.click(p.x,p.y)}
// 单值轨道从最小值填充，真实点击和轨道外拖动保持响应，完成通知不重复。
test('[slider.browser.drag] fill click capture and events',async({page},info)=>{
 const area=await demo(page,info,'basic'),handle=area.getByRole('slider',{name:'音量'})
 const width=(await rail(handle).boundingBox())!.width;await expect.poll(async()=>Math.abs((await track(handle).boundingBox())!.width-width*0.3)).toBeLessThan(1)
 await clickAt(page,handle,50);await expect(handle).toHaveAttribute('aria-valuenow','50');await expect(handle).toBeFocused();await expect(area.locator('output')).toHaveText('音量：50；变化：1；完成：1')
 const p=await point(handle,50);await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+width,p.y+70);await page.mouse.up();await expect(handle).toHaveAttribute('aria-valuenow','100');await expect(area.locator('output')).toHaveText('音量：100；变化：2；完成：2')
})
// 键盘可聚焦且有可见焦点环，受控父层接受或拒绝均保持正确位置。
test('[slider.browser.controlled] keyboard focus and parent authority',async({page},info)=>{
 const area=await demo(page,info,'controlled'),handle=area.getByRole('slider',{name:'受控进度'}),fixed=area.getByRole('slider',{name:'固定进度'})
 const unfocused=await handle.evaluate(el=>getComputedStyle(el).boxShadow);await handle.focus();await handle.press('ArrowRight');await expect(handle).toHaveAttribute('aria-valuenow','21');await expect(handle).not.toHaveCSS('box-shadow','none');await expect(handle).not.toHaveCSS('box-shadow',unfocused)
 await area.screenshot({path:info.outputPath('focus.png')})
 await handle.press('Shift+ArrowRight');await expect(handle).toHaveAttribute('aria-valuenow','31');await handle.press('Home');await expect(handle).toHaveAttribute('aria-valuenow','0');await handle.press('End');await expect(handle).toHaveAttribute('aria-valuenow','100')
 await area.getByRole('button',{name:'设置为 80'}).click();await expect(handle).toHaveAttribute('aria-valuenow','80')
 await fixed.press('ArrowRight');await expect(fixed).toHaveAttribute('aria-valuenow','30');await expect(area.getByText('请求：31')).toBeVisible();await clickAt(page,fixed,70);await expect(fixed).toHaveAttribute('aria-valuenow','30')
})
// 双滑块 Home/End 不交叉，Tab 能访问重叠的两端，轨道宽度跟随范围。
test('[slider.browser.range] no crossing and overlapping handles',async({page},info)=>{
 const area=await demo(page,info,'range'),start=area.getByRole('slider',{name:'预算起点',exact:true}),end=area.getByRole('slider',{name:'预算终点',exact:true})
 const width=(await rail(start).boundingBox())!.width;await expect.poll(async()=>Math.abs((await track(start).boundingBox())!.width-width*0.4)).toBeLessThan(1)
 await start.press('End');await expect(start).toHaveAttribute('aria-valuenow','60');await expect(end).toHaveAttribute('aria-valuenow','60');await start.press('Tab');await expect(end).toBeFocused();await end.press('ArrowRight');await expect(end).toHaveAttribute('aria-valuenow','61')
 await end.press('Home');await expect(end).toHaveAttribute('aria-valuenow','60');await start.press('ArrowLeft');await expect(start).toHaveAttribute('aria-valuenow','59')
 await expect(start).toHaveAttribute('aria-valuemax','60');await expect(end).toHaveAttribute('aria-valuemin','59')
})
// 刻度有实际 4px 圆点和零标签，离散键盘、指针、小数步长和连续取值有效。
test('[slider.browser.marks] ticks precision and free values',async({page},info)=>{
 const area=await demo(page,info,'marks'),handle=area.getByRole('slider',{name:'仅刻度'})
 await expect(rail(handle).getByText('0',{exact:true})).toBeVisible();const dot=rail(handle).locator(':scope > span').nth(2);await expect(dot).toHaveCSS('width','4px');await expect(dot).toHaveCSS('height','4px')
 await handle.press('ArrowRight');await expect(handle).toHaveAttribute('aria-valuenow','60');await clickAt(page,handle,30);await expect(handle).toHaveAttribute('aria-valuenow','25')
 const decimal=area.getByRole('slider',{name:'小数步长'});await decimal.press('ArrowRight');await expect(decimal).toHaveAttribute('aria-valuenow','0.3')
 const free=area.getByRole('slider',{name:'连续取值'});await clickAt(page,free,37.3);const value=Number(await free.getAttribute('aria-valuenow'));expect(value).toBeGreaterThan(37);expect(value).toBeLessThan(38)
 await area.screenshot({path:info.outputPath('marks.png')})
})
// 垂直/反向的滑块中心与填充几何一致，真实点击按正确轴映射。
test('[slider.browser.geometry] vertical and reverse',async({page},info)=>{
 const area=await demo(page,info,'directions')
 for(const [name,vertical,reverse] of [['水平反向',false,true],['垂直',true,false],['垂直反向',true,true]] as const){
  const handle=area.getByRole('slider',{name,exact:true}),r=(await rail(handle).boundingBox())!,h=(await handle.boundingBox())!,t=(await track(handle).boundingBox())!
  expect(Math.abs((vertical?r.y+r.height-h.y-h.height/2:h.x+h.width/2-r.x)-(vertical?r.height:r.width)*(reverse?0.7:0.3))).toBeLessThan(1)
  expect(Math.abs((vertical?t.height:t.width)-(vertical?r.height:r.width)*0.3)).toBeLessThan(1);await expect(handle).toHaveAttribute('aria-orientation',vertical?'vertical':'horizontal')
  await clickAt(page,handle,75,vertical);await expect(handle).toHaveAttribute('aria-valuenow',reverse?'25':'75')
 }
 await area.screenshot({path:info.outputPath('directions.png')})
})
// ref 聚焦不改值，disabled 拦截交互；拖动中卸载后旧全局监听不再更新输出。
test('[slider.browser.lifecycle] ref disable unmount during drag',async({page},info)=>{
 const area=await demo(page,info,'native'),handle=area.getByRole('slider',{name:'可切换滑块'})
 await area.getByRole('button',{name:'聚焦滑块'}).click();await expect(handle).toBeFocused();await expect(handle).toHaveAttribute('aria-valuenow','40');await expect(rail(handle).locator('..')).toHaveAttribute('id','slider-native');await expect(rail(handle).locator('..')).toHaveCSS('width','260px')
 await area.getByRole('button',{name:'切换禁用'}).click();await expect(handle).toHaveAttribute('aria-disabled','true');await expect(handle).toHaveAttribute('tabindex','-1');await handle.press('ArrowRight');await expect(handle).toHaveAttribute('aria-valuenow','40');await area.getByRole('button',{name:'切换禁用'}).click()
 const p=await point(handle,50);await page.mouse.move(p.x,p.y);await page.mouse.down();await expect(area.locator('output')).toHaveText('当前：50');await area.getByRole('button',{name:'挂载或卸载'}).press('Enter');await expect(handle).toHaveCount(0);await page.mouse.move(p.x+100,p.y);await page.mouse.up();await expect(area.locator('output')).toHaveText('当前：50')
})
// 单值与范围字段真实提交数字/数组，配置禁用可由字段/显式属性覆盖。
test('[slider.browser.form] scalar and pair submission',async({page},info)=>{
 const area=await demo(page,info,'context'),single=area.getByRole('slider',{name:'表单音量'}),end=area.getByRole('slider',{name:'表单预算终点'})
 await expect(area.getByRole('slider',{name:'全局禁用'})).toHaveAttribute('aria-disabled','true');await expect(area.getByRole('slider',{name:'显式启用'})).toHaveAttribute('aria-disabled','false')
 await single.press('ArrowRight');await end.press('ArrowRight');await area.getByRole('button',{name:'提交滑块'}).click();await expect(area.locator('output')).toHaveText('{"volume":21,"budget":[20,61]}')
 await area.getByRole('button',{name:'重置滑块'}).click();await expect(single).toHaveAttribute('aria-valuenow','20');await expect(end).toHaveAttribute('aria-valuenow','60')
})
// 开发 CSS 同样绘制轨道和刻度；组件无 owner 清理或未追踪读取提示。
test('[slider.browser.dev] development paint and owner',async({page})=>{
 const messages:string[]=[];page.on('console',msg=>messages.push(msg.text()));page.on('pageerror',error=>messages.push(error.message))
 await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE??'/'}${path}`)
 const handle=page.locator('[data-demo="slider/basic"]').getByRole('slider',{name:'音量'});await expect(track(handle)).toHaveCSS('height','4px');await expect(handle).toHaveCSS('border-top-width','2px');expect((await track(handle).boundingBox())!.width).toBeGreaterThan(0)
 expect(messages.filter(message=>message.includes('NO_OWNER_CLEANUP')||message.includes('STRICT_READ_UNTRACKED')&&message.includes('Slider'))).toEqual([])
})
// 正文、API 和同文件示例源码直接存在于原始静态 HTML。
test('[slider.browser.ssr] API and source',async({request})=>{const response=await request.get(path);expect(response.ok()).toBe(true);const html=await response.text();expect(html).toContain('SliderProps API');expect(html).toContain('slider/range');expect(html).toContain('onAfterChange')})
