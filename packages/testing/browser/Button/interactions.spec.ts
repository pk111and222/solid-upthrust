import { expect, test } from '@playwright/test'
// 在 docs 与 example 实际产物中验证尺寸、图标绘制、键盘和实例激活。
test('[button.browser.interactions] 布局与键盘交互', async ({page},info) => {
  const docs=info.project.name==='docs'
  await page.goto(docs ? 'components/general/button/' : 'Button')
  const demo=(id:string)=>page.locator(docs ? `[data-demo="button/${id}"]` : `[data-button-demo="${id}"]`)
  const sizes=demo('size')
  for (const [name,height] of [['小号',24],['中号',32],['大号',40]] as const) await expect(sizes.getByRole('button',{name,exact:true})).toHaveCSS('height',`${height}px`)
  const circle=sizes.getByRole('button',{name:'搜索',exact:true}); const box=await circle.boundingBox(); expect(box!.width).toBeCloseTo(box!.height,0)
  expect(await circle.locator('.i-mdi-magnify').evaluate(el=>getComputedStyle(el).maskImage)).not.toBe('none')
  const native=demo('native'); const count=native.getByRole('button',{name:'计数',exact:true})
  await count.press('Enter'); await count.press('Space'); await expect(native.locator('output')).toHaveText('点击次数：2')
  await native.getByRole('button',{name:'通过实例点击'}).click(); await expect(native.locator('output')).toHaveText('点击次数：3')
  const block=demo('block'); expect((await block.getByRole('button').boundingBox())!.width).toBeCloseTo(await block.getByRole('button').evaluate(el => el.parentElement!.getBoundingClientRect().width),0)
  await page.screenshot({path:`test-results/button/${info.project.name}-desktop.png`,fullPage:true,animations:'disabled'})
  await page.setViewportSize({width:390,height:844})
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})
// 验证默认按钮不提交、提交与重置语义、加载阻止重复触发、禁用链接无目标。
test('[button.browser.form-loading] 表单与加载状态', async ({page},info) => {
  const docs=info.project.name==='docs'
  await page.goto(docs ? 'components/general/button/' : 'Button')
  const demo=(id:string)=>page.locator(docs ? `[data-demo="button/${id}"]` : `[data-button-demo="${id}"]`)
  const form=demo('form'); await form.getByRole('button',{name:'普通按钮'}).click(); await expect(form.locator('output')).toHaveText('提交次数：0')
  await form.getByRole('button',{name:'提交',exact:true}).press('Enter'); await expect(form.locator('output')).toHaveText('提交次数：1')
  await form.getByRole('textbox',{name:'名称'}).fill('修改'); await form.getByRole('button',{name:'重置'}).click(); await expect(form.getByRole('textbox')).toHaveValue('示例')
  const loading=demo('loading'); const save=loading.getByRole('button',{name:'保存',exact:true})
  await save.press('Enter'); await expect(save).toHaveAttribute('aria-busy','true'); await save.press('Enter')
  await loading.getByRole('button',{name:'完成请求'}).click(); await expect(save).not.toHaveAttribute('aria-busy')
  const duration=demo('duration').getByRole('button'); await duration.click(); await expect(duration).toHaveAttribute('aria-busy','true'); await expect(duration).not.toHaveAttribute('aria-busy',{timeout:3000})
  const disabled=demo('disabled').getByRole('link',{name:'禁用链接'}); await expect(disabled).not.toHaveAttribute('href'); await expect(disabled).toHaveAttribute('tabindex','-1')
  const link=demo('link').getByRole('link',{name:'查看 API'}); await expect(link).toHaveJSProperty('tagName','A'); await link.press('Enter'); await expect(page).toHaveURL(/#api$/)
})
// 静态文档包含完整 API 和十二个互相独立的源码区。
test('[button.browser.docs] 独立示例源码与 API', async ({page},info) => {
  await page.goto('components/general/button/')
  const sections=page.locator('[data-demo-section]'); await expect(sections).toHaveCount(12)
  await sections.first().locator('summary').click(); await expect(sections.locator('details[open]')).toHaveCount(1)
  await expect(sections.first().locator('pre')).toContainText('type="primary"')
  await expect(page.locator('[data-api-table]')).toContainText('htmlType')
})
// 虚线必须是浏览器实际绘制的边框样式，而不只是存在 border-dashed 类名。
test('[button.browser.dashed] 虚线边框真实绘制', async ({page},info) => {
  const docs=info.project.name==='docs'
  await page.goto(docs ? 'components/general/button/' : 'Button')
  const demo=(id:string)=>page.locator(docs ? `[data-demo="button/${id}"]` : `[data-button-demo="${id}"]`)
  const dashed=demo('basic').getByRole('button',{name:'虚线按钮',exact:true})
  await expect(dashed).toHaveCSS('border-top-style','dashed')
  await expect(dashed).toHaveCSS('border-top-width','1px')
  await dashed.hover()
  await expect(dashed).toHaveCSS('border-bottom-style','dashed')
  for (const color of ['default','primary','danger']) {
    const button=demo('variants').getByRole('button',{name:`dashed / ${color}`,exact:true})
    await expect(button).toHaveCSS('border-left-style','dashed')
    await expect(button).toHaveCSS('border-right-style','dashed')
  }
  await expect(demo('basic').getByRole('button',{name:'默认按钮',exact:true})).toHaveCSS('border-top-style','solid')
})
