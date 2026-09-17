import {expect,test} from '@playwright/test'
// 在开发/构建两种模式核实真实色块、行高、间距和 CSS 字符串头像尺寸。
test('[skeleton.browser.geometry] 色块与几何布局',async({page},info)=>{
  const docs=info.project.name==='docs'
  await page.goto(docs?'components/feedback/skeleton/':'Skeleton')
  const demo=(id:string)=>page.locator(docs?`[data-demo="skeleton/${id}"]`:`[data-skeleton-demo="${id}"]`)
  const root=demo('basic').locator('[aria-hidden="true"]')
  const lines=root.locator(':scope > div > div');await expect(lines).toHaveCount(4)
  for(const line of await lines.all()){
    await expect(line).toHaveCSS('height','16px')
    expect(await line.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)')
  }
  const boxes=await Promise.all((await lines.all()).map(line=>line.boundingBox()))
  expect(boxes[1]!.y-boxes[0]!.y-boxes[0]!.height).toBe(8)
  expect(boxes[2]!.y-boxes[1]!.y-boxes[1]!.height).toBe(16)
  const avatars=demo('avatar').locator('[aria-hidden="true"] > span')
  await expect(avatars.nth(0)).toHaveCSS('width','32px');await expect(avatars.nth(1)).toHaveCSS('width','48px')
  const layout=await avatars.first().evaluate(el=>({gap: getComputedStyle(el.parentElement!).columnGap, radius:getComputedStyle(el).borderRadius}))
  expect(layout.gap).toBe('16px');expect(parseFloat(layout.radius)).toBeGreaterThan(16)
  const widths=demo('width').locator('[aria-hidden="true"] > div > div')
  expect((await widths.nth(0).boundingBox())!.width/(await widths.nth(1).boundingBox())!.width).toBeCloseTo(.5,1)
  await expect(widths.nth(2)).toHaveCSS('width','160px')
  const buttons=demo('button').locator('span[aria-hidden="true"]');await expect(buttons.nth(0)).toHaveCSS('height','24px');await expect(buttons.nth(1)).toHaveCSS('height','32px');await expect(buttons.nth(2)).toHaveCSS('width','40px')
  const nodes=demo('node').locator('span[aria-hidden="true"]');await expect(nodes.nth(0)).toHaveCSS('width','100px');await expect(nodes.nth(1)).toHaveCSS('width','32px');await expect(nodes.nth(2)).toHaveCSS('width','64px')
  await page.evaluate(()=>window.scrollTo(0,0))
  await page.screenshot({path:`test-results/skeleton/${info.project.name}-desktop.png`,fullPage:true,animations:'disabled'})
  await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.screenshot({path:`test-results/skeleton/${info.project.name}-mobile.png`,fullPage:true,animations:'disabled'})
})
// 动画真实生成且能关闭，主题切换改变渐变颜色，减少动态效果偏好停止动画。
test('[skeleton.browser.theme-motion] 主题与动画',async({page},info)=>{
  const docs=info.project.name==='docs';await page.goto(docs?'components/feedback/skeleton/':'Skeleton')
  const demo=(id:string)=>page.locator(docs?`[data-demo="skeleton/${id}"]`:`[data-skeleton-demo="${id}"]`)
  const active=demo('active').locator('[aria-hidden="true"] > div > div').first()
  await expect(active).toHaveCSS('animation-name','ut-skeleton-wave');await expect(active).toHaveCSS('background-size','200% 100%')
  await expect(active).toHaveCSS('animation-duration','1.6s');expect(await active.evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('linear-gradient')
  await demo('active').getByRole('button',{name:'切换动画'}).click();await expect(active).toHaveCSS('animation-name','none')
  const theme=demo('theme').locator('[aria-hidden="true"] > div > div').first();const before=await theme.evaluate(el=>getComputedStyle(el).backgroundImage)
  await demo('theme').getByRole('button',{name:'切换深色'}).click();await expect.poll(()=>theme.evaluate(el=>getComputedStyle(el).backgroundImage)).not.toBe(before)
  await page.emulateMedia({reducedMotion:'reduce'});await expect(theme).toHaveCSS('animation-name','none')
})
// 真正的内容切换可通过键盘操作，占位没有伪按钮，实例读取与 aria-busy 一致。
test('[skeleton.browser.loading] 加载切换与可访问性',async({page},info)=>{
  const docs=info.project.name==='docs';await page.goto(docs?'components/feedback/skeleton/':'Skeleton')
  const demo=page.locator(docs?'[data-demo="skeleton/loading"]':'[data-skeleton-demo="loading"]')
  const region=demo.getByRole('region',{name:'文章'});await expect(region).toHaveAttribute('aria-busy','true');await expect(region.getByRole('article')).toHaveCount(0)
  await demo.getByRole('button',{name:'读取实例'}).click();await expect(demo.locator('output')).toHaveText('加载中')
  await demo.getByRole('button',{name:'切换加载'}).press('Enter');await expect(region).toHaveAttribute('aria-busy','false');await expect(region.getByRole('heading',{name:'内容已就绪'})).toBeVisible()
  await demo.getByRole('button',{name:'读取实例'}).click();await expect(demo.locator('output')).toHaveText('已完成')
  await demo.getByRole('button',{name:'切换加载'}).press('Space');await expect(region.getByRole('article')).toHaveCount(0)
  const buttonDemo=page.locator(docs?'[data-demo="skeleton/button"]':'[data-skeleton-demo="button"]');await expect(buttonDemo.getByRole('button')).toHaveCount(0)
})
// 开发模式也检查真实绘制，防止只有构建产物的 CSS 正常。
test('[skeleton.browser.docs-dev] 开发页面真实样式',async({page})=>{
  const base=process.env.DOCS_BASE??'/'
  await page.goto(`http://127.0.0.1:5658${base}components/feedback/skeleton/`)
  const line=page.locator('[data-demo="skeleton/active"] [aria-hidden="true"] > div > div').first()
  await expect(line).toHaveCSS('height','16px');await expect(line).toHaveCSS('animation-name','ut-skeleton-wave')
  expect(await line.evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('linear-gradient')
  await expect(page.locator('[data-demo-section]')).toHaveCount(12)
  const first=page.locator('[data-demo-section]').first();await first.locator('summary').click();await expect(first.locator('pre')).toContainText('<Skeleton />')
  await expect(page.locator('[data-demo-section] details[open]')).toHaveCount(1)
  await expect(page.locator('[data-api-table]')).toHaveCount(5)
  for (const name of ['button','avatar','input','node']) {
    const section=page.locator(`section[aria-labelledby="skeleton-${name}"]`)
    await expect(section.locator('[data-api-table]')).toHaveCount(1)
    await expect(section.locator('[data-demo-section]')).toHaveCount(1)
    await expect(section.locator('[data-api-table]')).toContainText('size')
  }
})
