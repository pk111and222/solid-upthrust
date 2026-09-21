import { test, expect, type Page, type TestInfo } from '@playwright/test'
const path = 'components/data-entry/input-number/'
async function demo(page: Page, info: TestInfo, id: string) {
  await page.goto(info.project.name === 'docs' ? path : 'InputNumber')
  return page.locator(info.project.name === 'docs' ? `[data-demo="input-number/${id}"]` : `[data-input-number-demo="${id}"]`)
}
// 原生输入保留越界草稿并给出错误提示，失焦裁剪，空值与小数点可以编辑。
test('[input-number.browser.edit] draft clamp and clear', async ({ page }, info) => {
  const area = await demo(page, info, 'basic'), input = area.getByRole('spinbutton', { name: '数量', exact: true })
  const normal = await input.evaluate(el => getComputedStyle(el).color)
  await input.fill('99'); await expect(input).toHaveAttribute('aria-invalid', 'true'); await expect(input).not.toHaveCSS('color', normal)
  await input.press('Tab'); await expect(input).toHaveValue('10'); await expect(input).not.toHaveAttribute('aria-invalid', 'true')
  await input.fill(''); await expect(input).toHaveValue(''); await input.press('ArrowUp'); await expect(input).toHaveValue('1')
  await input.fill('1.'); await expect(input).toHaveValue('1.'); await input.press('Tab'); await expect(input).toHaveValue('1')
})
// 父层接受、拒绝和外部更新各有真实反馈，拒绝的步进不能使显示漂移。
test('[input-number.browser.controlled] accepted rejected external', async ({ page }, info) => {
  const area = await demo(page, info, 'controlled'), input = area.getByRole('spinbutton', { name: '受控数量' }), fixed = area.getByRole('spinbutton', { name: '固定数量' })
  await input.fill('4'); await expect(area.getByText('数量：4', { exact: true })).toBeVisible()
  await area.getByRole('button', { name: '设置数量为 8' }).click(); await expect(input).toHaveValue('8')
  await fixed.press('ArrowUp'); await expect(fixed).toHaveValue('2'); await expect(area.getByText('最近请求：3')).toBeVisible()
  await fixed.fill('9'); await expect(fixed).toHaveValue('9'); await fixed.press('Tab'); await expect(fixed).toHaveValue('2')
})
// 鼠标与键盘步进保持小数精度，Shift 乘数、边界按钮及指数步长有效。
test('[input-number.browser.step] precision shift and bounds', async ({ page }, info) => {
  const area = await demo(page, info, 'precision'), input = area.getByRole('spinbutton', { name: '小数步进' })
  await input.press('ArrowUp'); await expect(input).toHaveValue('0.2'); await expect(area.locator('output')).toHaveText('up：0.2；偏移：0.1')
  await input.press('Shift+ArrowUp'); await expect(input).toHaveValue('1'); await expect(input.locator('..').getByRole('button', { name: 'increase', exact: true })).toBeDisabled()
  const precise = area.getByRole('spinbutton', { name: '两位精度' }); await precise.press('Shift+ArrowUp'); await expect(precise).toHaveValue('2.25')
  await precise.fill('2.256'); await precise.press('Tab'); await expect(precise).toHaveValue('2.26')
  const tiny = area.getByRole('spinbutton', { name: '微小步长' }); await tiny.press('ArrowUp'); await tiny.press('ArrowUp'); await expect(tiny).toHaveValue('2e-7')
})
// formatter/parser 不污染数字状态，装饰不遮住输入，隐藏按钮不关闭键盘操作。
test('[input-number.browser.format] parser affixes and controls', async ({ page }, info) => {
  const area = await demo(page, info, 'format'), input = area.getByRole('spinbutton', { name: '金额' })
  await expect(input).toHaveValue('$ 1,000'); await input.fill('$ 2,345.678'); await input.press('Tab'); await expect(input).toHaveValue('$ 2,345.68'); await expect(input).toHaveAttribute('aria-valuenow', '2345.68')
  const hidden = area.getByRole('spinbutton', { name: '隐藏按钮' }); await expect(hidden.locator('..').getByRole('button')).toHaveCount(0); await hidden.press('ArrowUp'); await expect(hidden).toHaveValue('6')
  const percent = area.getByRole('spinbutton', { name: '百分比' }), bounds = (await percent.boundingBox())!, suffix = (await percent.locator('..').getByText('%', { exact: true }).boundingBox())!
  expect(bounds.width).toBeGreaterThan(40); expect(bounds.x + bounds.width).toBeLessThanOrEqual(suffix.x)
})
// 三种高度、状态边框、图标、聚焦环与 RTL 在生产 CSS 下有真实绘制。
test('[input-number.browser.paint] sizes states icons and RTL', async ({ page }, info) => {
  const area = await demo(page, info, 'states')
  for (const [name, height] of [['小号',24],['中号',32],['大号',40]] as const) await expect(area.getByRole('spinbutton',{name,exact:true}).locator('..')).toHaveCSS('height',`${height}px`)
  const middle = area.getByRole('spinbutton', { name: '中号', exact: true }); await middle.focus(); await expect(middle.locator('..')).not.toHaveCSS('box-shadow','none'); await expect(middle.locator('..')).toHaveCSS('border-top-width','1px')
  const icon = middle.locator('..').locator('.i-mdi-chevron-up'); await expect(icon).not.toHaveCSS('mask-image','none'); expect((await icon.boundingBox())!.width).toBeGreaterThan(0); expect((await icon.boundingBox())!.height).toBeGreaterThan(0); await expect(icon.locator('../..')).toHaveCSS('opacity','1')
  const error = area.getByRole('spinbutton',{name:'错误'}), warning = area.getByRole('spinbutton',{name:'警告'}); await expect(error).toHaveAttribute('aria-invalid','true'); expect(await error.locator('..').evaluate(el=>getComputedStyle(el).borderTopColor)).not.toBe(await warning.locator('..').evaluate(el=>getComputedStyle(el).borderTopColor))
  const disabled = area.getByRole('spinbutton',{name:'禁用',exact:true}), readonly = area.getByRole('spinbutton',{name:'只读'}); await expect(disabled).toBeDisabled(); await expect(readonly).toHaveAttribute('readonly',''); await readonly.press('ArrowUp'); await expect(readonly).toHaveValue('8'); await expect(readonly.locator('..').getByRole('button')).toHaveCount(0)
  await area.getByRole('button',{name:'切换禁用'}).click(); await expect(disabled).toBeEnabled(); await disabled.press('ArrowDown'); await expect(disabled).toHaveValue('7')
  const rtl = area.getByRole('spinbutton',{name:'从右向左'}); await rtl.focus(); const r=(await rtl.boundingBox())!, up=(await rtl.locator('..').getByRole('button',{name:'increase',exact:true}).boundingBox())!; expect(up.x+up.width).toBeLessThanOrEqual(r.x)
  await area.screenshot({path:info.outputPath('states.png')})
})
// ref 只聚焦，Enter 回调和原生 name/style 正常，方向键再改变数值。
test('[input-number.browser.ref] focus and native events', async ({ page }, info) => {
  const area=await demo(page,info,'native'), input=area.getByRole('spinbutton',{name:'原生输入'})
  await area.getByRole('button',{name:'聚焦数字输入框'}).click(); await expect(input).toBeFocused(); await expect(input).toHaveValue('3'); await expect(area.locator('output')).toHaveText('已聚焦'); await expect(input).toHaveAttribute('name','amount'); await expect(input.locator('..')).toHaveCSS('width','160px')
  await input.press('Enter'); await expect(area.locator('output')).toHaveText('已按 Enter'); await input.press('ArrowDown'); await expect(input).toHaveValue('2')
})
// 增减按钮保留输入焦点且不提交 Form，字段提交数字/null，重置恢复初值。
test('[input-number.browser.form] focus buttons submit and reset', async ({ page }, info) => {
  const area=await demo(page,info,'context'), input=area.getByRole('spinbutton',{name:'订单数量'})
  await expect(area.getByRole('spinbutton',{name:'全局禁用'})).toBeDisabled(); await expect(area.getByRole('spinbutton',{name:'显式启用'})).toBeEnabled()
  await input.focus(); await input.locator('..').getByRole('button',{name:'increase',exact:true}).click(); await expect(input).toBeFocused(); await expect(input).toHaveValue('3'); await expect(area.locator('output')).toHaveText('尚未提交')
  await area.getByRole('button',{name:'提交数量'}).click(); await expect(area.locator('output')).toHaveText('{"quantity":3}')
  await input.fill(''); await area.getByRole('button',{name:'提交数量'}).click(); await expect(area.locator('output')).toHaveText('{"quantity":null}')
  await area.getByRole('button',{name:'重置数量'}).click(); await expect(input).toHaveValue('2')
})
// 开发模式同样生成真实边框、控件高度和步进图标。
test('[input-number.browser.dev] development paint', async ({page})=>{
  await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE??'/'}${path}`)
  const input=page.locator('[data-demo="input-number/states"]').getByRole('spinbutton',{name:'小号',exact:true}); await input.focus(); await expect(input.locator('..')).toHaveCSS('height','24px'); await expect(input.locator('..')).toHaveCSS('border-top-width','1px'); await expect(input.locator('..').locator('.i-mdi-chevron-up')).not.toHaveCSS('mask-image','none')
})
// 原始 HTML 包含完整 API 和示例源码，正文不依赖客户端执行。
test('[input-number.browser.ssr] static API and source', async ({request})=>{
  const response=await request.get(path); expect(response.ok()).toBe(true); const html=await response.text(); expect(html).toContain('InputNumberProps API'); expect(html).toContain('input-number/precision'); expect(html).toContain('shiftMultiplier')
})
