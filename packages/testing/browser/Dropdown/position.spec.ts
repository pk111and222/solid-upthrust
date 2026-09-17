import {expect,test} from '@playwright/test'
import {gotoDropdown,triggerButton,triggerRoot,menuFor,waitMenuOpen,expectPlacement,centerTrigger} from '../../utils/dropdown-browser'
// 页面滚动后 absolute 菜单仍须以触发器为锚点；主题 Portal 的相对容器不能引入额外偏移。
for (const [id,name] of [['click','点击菜单'],['theme','局部主题菜单']] as const) {
  // 同时覆盖 body Portal 与相对定位的主题容器，检查开关和再次滚动。
  test(`[dropdown.position.${id}] 滚动与 Portal 坐标`,async({page},info)=>{
    const demo=await gotoDropdown(page,info,id)
    const button=triggerButton(demo,name);await centerTrigger(button);await button.click()
    const root=triggerRoot(button),menu=await menuFor(page,root);await waitMenuOpen(menu)
    await expectPlacement(root,menu,'bottomLeft')
    await page.evaluate(()=>window.scrollBy(0,60))
    await expectPlacement(root,menu,'bottomLeft')
    await page.keyboard.press('Escape');await expect(root).toHaveAttribute('aria-expanded','false')
  })
}
// 开发服务器与静态构建一样验证真实菜单几何位置。
test('[dropdown.browser.dev] 开发页面滚动定位',async({page})=>{
  await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE??'/'}components/navigation/dropdown/`)
  const button=page.locator('[data-demo="dropdown/theme"]').getByRole('button',{name:'局部主题菜单',exact:true})
  await centerTrigger(button);await button.click();const root=triggerRoot(button),menu=await menuFor(page,root)
  await waitMenuOpen(menu);await expectPlacement(root,menu,'bottomLeft')
})
// 十二种方向均按实际边缘对齐，窗口滚动不能改变视口测量与绝对坐标之间的转换。
for (const placement of ['topLeft','top','topRight','bottomLeft','bottom','bottomRight','leftTop','left','leftBottom','rightTop','right','rightBottom'] as const) {
  test(`[dropdown.position.all] ${placement}`,async({page},info)=>{
    const demo=await gotoDropdown(page,info,'placement');const button=triggerButton(demo,placement)
    await centerTrigger(button);await button.click();const root=triggerRoot(button),menu=await menuFor(page,root)
    await waitMenuOpen(menu);await expectPlacement(root,menu,placement)
  })
}
