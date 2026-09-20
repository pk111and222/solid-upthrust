import {test,expect,type Page,type TestInfo,type Locator} from '@playwright/test'
const route='components/data-entry/tree/'
async function demo(page:Page,info:TestInfo,id:string){
 await page.goto(info.project.name==='docs'?route:'Tree')
 return page.locator(info.project.name==='docs'?`[data-demo="tree/${id}"]`:`[data-tree-demo="${id}"]`)
}
function row(area:Locator,name:string){return area.getByRole('treeitem',{name,exact:true})}
async function painting(area:Locator){
 const parent=row(area,'项目'),strip=parent.locator(':scope > div').first()
 await expect(strip).toHaveCSS('height','24px')
 const icon=strip.locator('.i-mdi-folder-open-outline');await expect(icon).toBeVisible();await expect(icon).not.toHaveCSS('mask-image','none')
 const group=parent.getByRole('group').first();await expect(group).toHaveCSS('border-left-width','1px')
 const a=(await row(area,'文档').boundingBox())!,p=(await parent.boundingBox())!;expect(Math.abs(a.x-p.x-32)).toBeLessThan(2)
}
async function checkMark(item:Locator,kind:'check'|'minus') {
 const icon=item.locator(':scope > div').first().locator(`.i-mdi-${kind}`)
 await expect(icon).toBeVisible()
 await expect(icon).not.toHaveCSS('mask-image','none')
 const box=(await icon.boundingBox())!
 expect(box.width).toBeGreaterThanOrEqual(10);expect(box.height).toBeGreaterThanOrEqual(10)
 await expect(icon).not.toHaveCSS('background-color','rgba(0, 0, 0, 0)')
 if(kind==='check') {
   const rgba=await icon.evaluate(el=>{
     const canvas=document.createElement('canvas');canvas.width=canvas.height=1
     const ctx=canvas.getContext('2d')!;ctx.fillStyle=getComputedStyle(el).color;ctx.fillRect(0,0,1,1)
     return Array.from(ctx.getImageData(0,0,1,1).data)
   })
   expect(rgba).toEqual([255,255,255,255])
 }
}
// 折叠节点不参与可访问树；真实键盘在可用节点之间移动并保持单一 Tab 停靠点。
test('[tree.browser.keyboard] expansion focus and selection',async({page},info)=>{
 const area=await demo(page,info,'basic'),parent=row(area,'项目')
 await parent.focus();await parent.press('ArrowRight');await expect(row(area,'文档')).toBeFocused()
 await page.keyboard.press('ArrowDown');await expect(row(area,'源码')).toBeFocused()
 await page.keyboard.press('ArrowDown');await expect(row(area,'其他')).toBeFocused()
 await page.keyboard.press('Home');await expect(parent).toBeFocused();await parent.press('ArrowLeft')
 await expect(parent).toHaveAttribute('aria-expanded','false');await expect(row(area,'文档')).toHaveCount(0)
 await parent.press('Enter');await expect(parent).toHaveAttribute('aria-selected','true')
 await expect(area.locator('[role="treeitem"][tabindex="0"]')).toHaveCount(1)
})
// 默认半选通过真实空格操作转为全选，禁用分支不被勾选。
test('[tree.browser.check] linked and strict checking',async({page},info)=>{
 let area=await demo(page,info,'check'),parent=row(area,'项目')
 await expect(parent).toHaveAttribute('aria-checked','mixed');await checkMark(parent,'minus');await parent.focus();await parent.press('Space')
 await expect(parent).toHaveAttribute('aria-checked','true');await checkMark(parent,'check');await area.screenshot({path:info.outputPath('checked.png'),animations:'disabled'});await expect(row(area,'源码')).toHaveAttribute('aria-checked','true')
 await expect(row(area,'归档')).toHaveAttribute('aria-checked','false')
 area=await demo(page,info,'strict');parent=row(area,'项目')
 await expect(parent).toHaveAttribute('aria-checked','true');await expect(row(area,'文档')).toHaveAttribute('aria-checked','false')
 await row(area,'其他').click();await expect(row(area,'其他')).toHaveAttribute('aria-selected','false');await expect(row(area,'文档')).toHaveAttribute('aria-selected','true')
})
// 三类受控事件更新父级信号后，DOM 与示例事件输出一致。
test('[tree.browser.controlled] expansion selection checking',async({page},info)=>{
 const area=await demo(page,info,'controlled'),parent=row(area,'项目')
 await parent.focus();await parent.press('ArrowRight');await expect(parent).toHaveAttribute('aria-expanded','true')
 await parent.press('Enter');await parent.press('Space');await expect(parent).toHaveAttribute('aria-selected','true');await expect(parent).toHaveAttribute('aria-checked','true')
 await expect(area.locator('output')).toContainText('展开：p；选中：p；勾选：p,a,b')
})
// 搜索展开匹配路径，无结果有自定义空态，清空恢复原始折叠状态。
test('[tree.browser.search] filtering empty and restore',async({page},info)=>{
 const area=await demo(page,info,'search'),input=area.getByRole('searchbox',{name:'搜索树节点'})
 await input.fill('文档');await expect(row(area,'文档')).toBeVisible();await expect(row(area,'源码')).toHaveCount(0)
 await input.fill('没有这个名称');await expect(area).toContainText('没有匹配节点')
 await input.fill('');await expect(row(area,'项目')).toHaveAttribute('aria-expanded','false')
})
// 禁用输入与行不会响应操作，解除禁用后恢复键盘导航。
test('[tree.browser.disabled] dynamic disabled',async({page},info)=>{
 const area=await demo(page,info,'disabled');await expect(area.getByRole('searchbox')).toBeDisabled()
 await expect(row(area,'项目')).toHaveAttribute('aria-disabled','true')
 await area.getByRole('button',{name:'切换禁用'}).click();await expect(area.getByRole('searchbox')).toBeEnabled()
 await row(area,'项目').focus();await page.keyboard.press('ArrowRight');await expect(row(area,'文档')).toBeFocused()
})
// 真实 CSS 验证行高、缩进、连接线和图标，截图供人工查看。
test('[tree.browser.paint] appearance and focus',async({page},info)=>{
 const area=await demo(page,info,'appearance');await painting(area)
 const parent=row(area,'项目');await parent.focus();await parent.press('ArrowDown')
 await expect(row(area,'文档').locator(':scope > div').first()).toHaveCSS('outline-style','solid')
 await expect(row(area,'文档').locator(':scope > div').first()).toHaveCSS('outline-offset','-2px')
 await area.screenshot({path:info.outputPath('tree.png'),animations:'disabled'})
})
// 标题输入框保持原生焦点与 Enter 行为，不触发行选择。
test('[tree.browser.embedded] input keeps focus',async({page},info)=>{
 const area=await demo(page,info,'editable'),input=area.getByRole('textbox',{name:'编辑标题文本'})
 await input.click();await expect(input).toBeFocused();await input.fill('新标题');await input.press('Enter')
 await expect(input).toBeFocused();await expect(area.locator('output')).toHaveText('选择：无')
})
// 原生 HTML5 拖拽从子节点移动到末尾，业务调用不可变 helper 更新树。
test('[tree.browser.drag] native drag reorders data',async({page},info)=>{
 const area=await demo(page,info,'drag'),source=row(area,'文档').locator(':scope > div').first(),target=row(area,'其他').locator(':scope > div').first()
 await source.dragTo(target,{targetPosition:{x:40,y:22}})
 await expect(row(area,'文档')).toHaveAttribute('aria-level','1');await expect(area.locator('output')).toHaveText('拖拽结束')
 const roots=area.locator('[role="treeitem"][aria-level="1"]')
 expect(await roots.evaluateAll(items=>items.map(el=>el.getAttribute('aria-label')))).toEqual(['项目','其他','文档'])
})
// 开发环境也检查图标与连接线的提取和绘制。
test('[tree.browser.dev] development rendering',async({page})=>{
 await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE??'/'}${route}`);const area=page.locator('[data-demo="tree/appearance"]');await painting(area)
 await row(area,'项目').focus();await page.keyboard.press('ArrowDown');await expect(row(area,'文档').locator(':scope > div').first()).toHaveCSS('outline-style','solid')
 const checked=page.locator('[data-demo="tree/check"]');await checkMark(row(checked,'项目'),'minus');await checkMark(row(checked,'文档'),'check')
})
// 仅验证此次共用渲染器的必要消费者：万条虚拟树键盘末尾定位与选择。
test('[tree.browser.panel] TreeSelect virtual integration',async({page})=>{
 await page.goto('TreeSelect')
 const input=page.getByRole('combobox').filter({hasText:'搜索 10000 个节点'});await input.click()
 const tree=page.getByRole('tree');await expect(tree).toBeVisible()
 expect(await tree.getByRole('treeitem').count()).toBeLessThan(20)
 const first=tree.getByRole('treeitem',{name:'节点 0',exact:true});await first.focus();await first.press('End')
 const last=tree.getByRole('treeitem',{name:'节点 9999',exact:true});await expect(last).toBeVisible();await expect(last).toBeFocused()
 await last.press('Enter');await expect(tree).toBeHidden()
})
