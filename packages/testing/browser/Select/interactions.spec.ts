import { expect, test, type Page, type TestInfo } from '@playwright/test'

const path = 'components/data-entry/select/'

async function demo(page: Page, info: TestInfo, id: string) {
  await page.goto(info.project.name === 'docs' ? path : 'Select')
  return page.locator(info.project.name === 'docs' ? `[data-demo="select/${id}"]` : `[data-select-demo="${id}"]`)
}

// 单选真实鼠标点击关闭浮层，清空按钮点击不重新打开，回调更新父层文本。
test('[select.browser.basic] select and clear by pointer', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const box = area.getByRole('combobox', { name: '水果' })
  await box.click()
  await expect(box).toHaveAttribute('aria-expanded', 'true')
  await page.getByRole('option', { name: '香蕉' }).click()
  await expect(box).toHaveAttribute('aria-expanded', 'false')
  await expect(info.project.name === 'docs' ? area.locator('output') : area).toContainText('banana')
  const clear = box.getByRole('button', { name: '清空' })
  await expect(clear).toBeVisible()
  expect((await clear.boundingBox())!.width).toBeGreaterThanOrEqual(24)
  await expect(box.locator('.i-mdi-chevron-down')).toHaveCount(0)
  await expect(clear.locator('.i-mdi-close')).toHaveCount(1)
  await clear.click()
  await expect(info.project.name === 'docs' ? area.locator('output') : area).toContainText(info.project.name === 'docs' ? '未选择' : '（未选）')
  await expect(box.locator('.i-mdi-chevron-down')).toHaveCount(1)
  await expect(box).toHaveAttribute('aria-expanded', 'false')
})

// 多选的左右内边距应与单选一致。
test('[select.browser.spacing] multiple inset matches single', async ({ page }, info) => {
  const single = (await demo(page, info, 'basic')).getByRole('combobox')
  const multiple = (await demo(page, info, 'multiple')).getByRole('combobox')
  const insets = async (box: typeof single) => box.evaluate(el => {
    const style = getComputedStyle(el)
    return [style.paddingLeft, style.paddingRight]
  })
  expect(await insets(multiple)).toEqual(await insets(single))
})

// 可搜索单选的输入覆盖层不能挡住清空按钮；清空后恢复下拉箭头。
test('[select.browser.search-clear] searchable single clear is clickable', async ({ page }, info) => {
  const area = await demo(page, info, 'search')
  const box = area.getByRole('combobox')
  await box.click()
  const label = info.project.name === 'docs' ? 'Banana' : '香蕉'
  await page.getByRole('option', { name: label }).click()
  const clear = box.getByRole('button', { name: '清空' })
  await expect(clear).toBeVisible()
  await expect(box.locator('.i-mdi-chevron-down')).toHaveCount(0)
  await clear.click()
  await expect(box).not.toContainText(label)
  await expect(box.locator('.i-mdi-chevron-down')).toHaveCount(1)
  await expect(box).toHaveAttribute('aria-expanded', 'false')
})

// 多选清空时也应只显示普通叉，提交空数组后恢复箭头。
test('[select.browser.multiple-clear] clear replaces suffix arrow', async ({ page }, info) => {
  const area = await demo(page, info, 'multiple')
  const box = area.getByRole('combobox')
  if (info.project.name === 'example') {
    await box.click()
    await page.getByRole('option', { name: '香蕉' }).click()
    await page.keyboard.press('Escape')
  }
  const clear = box.getByRole('button', { name: '清空' })
  await expect(clear).toBeVisible()
  await expect(box.locator('.i-mdi-chevron-down')).toHaveCount(0)
  await clear.click()
  await expect(area).toContainText('[]')
  await expect(box.locator('.i-mdi-chevron-down')).toHaveCount(1)
})

// 空 tags 激活时输入光标应位于左侧，不被占满剩余宽度的占位文字推向中间。
test('[select.browser.tags-caret] empty tags caret starts at left', async ({ page }, info) => {
  const tags = (await demo(page, info, 'tags')).getByRole('combobox')
  await tags.click()
  const input = tags.locator('input:not([type="hidden"])')
  await expect(input).toBeFocused()
  const tagBox = (await tags.boundingBox())!
  const inputBox = (await input.boundingBox())!
  expect(inputBox.x - tagBox.x).toBeLessThanOrEqual(20)
})

// 下拉层默认与选择框等宽，父容器宽度变化时同步更新。
test('[select.browser.width] popup follows selector width', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const box = area.getByRole('combobox', { name: '水果' })
  await box.click()
  const list = page.getByRole('listbox')
  await expect.poll(async () => Math.abs((await box.boundingBox())!.width - (await list.boundingBox())!.width)).toBeLessThanOrEqual(1)
  await box.evaluate(element => { (element.parentElement as HTMLElement).style.width = '300px' })
  await expect.poll(async () => Math.abs((await box.boundingBox())!.width - (await list.boundingBox())!.width)).toBeLessThanOrEqual(1)
  expect((await box.boundingBox())!.width).toBeCloseTo(300, 0)
})

// 真实键盘从搜索输入只移动一项；Enter 提交并关闭，Escape 可关闭未提交的列表。
test('[select.browser.keyboard] search input navigation and commit', async ({ page }, info) => {
  const area = await demo(page, info, 'search')
  const box = area.getByRole('combobox', { name: '搜索水果' })
  await box.click()
  const input = box.locator('input')
  await input.focus()
  await input.press('ArrowDown')
  const active = await box.getAttribute('aria-activedescendant')
  expect(active).toBeTruthy()
  await expect(page.locator(`#${active}`)).toContainText(info.project.name === 'docs' ? 'Banana' : '香蕉')
  await input.press('Enter')
  await expect(box).toHaveAttribute('aria-expanded', 'false')
  await box.click()
  await input.press('Escape')
  await expect(box).toHaveAttribute('aria-expanded', 'false')
})

// 搜索输入应执行过滤并显示空态；按键反馈来自 onSearch 而非重复处理。
test('[select.browser.search] filtering and empty state', async ({ page }, info) => {
  const area = await demo(page, info, 'search')
  const box = area.getByRole('combobox', { name: '搜索水果' })
  await box.click()
  const input = box.locator('input')
  await input.fill(info.project.name === 'docs' ? 'Ba' : '香')
  await expect(input).toHaveValue(info.project.name === 'docs' ? 'Ba' : '香')
  await expect(input).toHaveCSS('opacity', '1')
  await expect(page.getByRole('option')).toHaveCount(1)
  await expect(page.getByRole('option')).toContainText(info.project.name === 'docs' ? 'Banana' : '香蕉')
  await input.fill('zzzz')
  await expect(page.getByRole('option')).toHaveCount(0)
  await expect(page.getByRole('listbox')).toContainText(info.project.name === 'docs' ? '无匹配水果' : '无数据')
})

test('[select.browser.grouped] group headings survive filtering and selection', async ({ page }, info) => {
  const area = await demo(page, info, 'grouped')
  const box = area.getByRole('combobox')
  await box.click()
  const headings = page.locator('[data-select-group]')
  await expect(headings).toHaveCount(2)
  await expect(page.getByRole('option')).toHaveCount(info.project.name === 'docs' ? 4 : 3)
  const input = box.locator('input')
  await input.press('ArrowDown')
  const active = await box.getAttribute('aria-activedescendant')
  expect(active).toBeTruthy()
  await expect(page.locator(`#${active}`)).toContainText(info.project.name === 'docs' ? '香蕉' : '上海')
  await input.fill(info.project.name === 'docs' ? '茶' : '东京')
  await expect(headings).toHaveCount(1)
  await expect(headings).toContainText(info.project.name === 'docs' ? '饮料' : '日本')
  await page.getByRole('option', { name: info.project.name === 'docs' ? '茶' : '东京' }).click()
  await expect(box).toHaveAttribute('aria-expanded', 'false')
  await expect(box).toContainText(info.project.name === 'docs' ? '茶' : '东京')
})

test('[select.browser.dependent] changing parent clears child', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs', '文档新增演示')
  const area = await demo(page, info, 'dependent')
  const country = area.getByRole('combobox', { name: '国家' })
  const city = area.getByRole('combobox', { name: '城市' })
  await expect(city).toHaveAttribute('aria-disabled', 'true')
  await country.click()
  await page.getByRole('option', { name: '中国' }).click()
  await city.click()
  await page.getByRole('option', { name: '北京' }).click()
  await expect(area.locator('output')).toContainText('china / beijing')
  await country.click()
  await page.getByRole('option', { name: '日本' }).click()
  await expect(area.locator('output')).toContainText('japan / 未选城市')
})

test('[select.browser.remote] async options follow latest query', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs', '文档新增演示')
  const area = await demo(page, info, 'remote')
  const box = area.getByRole('combobox')
  await box.click()
  const input = box.locator('input')
  await input.fill('北京')
  await input.fill('东京')
  await expect(page.getByRole('option')).toHaveCount(1)
  await expect(page.getByRole('option')).toContainText('东京')
})

test('[select.browser.label-value] callback returns labeled object', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs', '文档新增演示')
  const area = await demo(page, info, 'label-value')
  await area.getByRole('combobox', { name: '对象值单选' }).click()
  await page.getByRole('option', { name: '香蕉' }).click()
  await expect(area.locator('output')).toContainText('"value":"banana"')
  await expect(area.locator('output')).toContainText('"label":"香蕉"')
})

// 清空按钮的 Enter 键应调用原生按钮行为，而非向 combobox 冒泡打开浮层。
test('[select.browser.clear-keyboard] keyboard clear does not open menu', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const box = area.getByRole('combobox', { name: '水果' })
  if (info.project.name === 'example') {
    await box.click()
    await page.getByRole('option', { name: '苹果' }).click()
  }
  const clear = box.getByRole('button', { name: '清空' })
  await clear.focus()
  await clear.press('Enter')
  await expect(box).toHaveAttribute('aria-expanded', 'false')
  await expect(info.project.name === 'docs' ? area.locator('output') : area).toContainText(info.project.name === 'docs' ? '未选择' : '（未选）')
})

// 多选标签可由原生按钮移除，按钮点击不会触发下拉层开关。
test('[select.browser.multiple] tag remove and popup persistence', async ({ page }, info) => {
  const area = await demo(page, info, 'multiple')
  const box = area.getByRole('combobox', { name: '多选水果' })
  await box.click()
  const target = info.project.name === 'docs' ? '梨' : '香蕉'
  await page.getByRole('option', { name: target }).click()
  await expect(box).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(box).toHaveAttribute('aria-expanded', 'false')
  const remove = box.getByRole('button', { name: info.project.name === 'docs' ? '移除 苹果' : '移除 香蕉' })
  await remove.click()
  await expect(box).toHaveAttribute('aria-expanded', 'false')
})

// tags 模式的真实输入与 Enter 提交自由标签，重复提交已选标签不会移除它。
test('[select.browser.tags] free entry and existing tag', async ({ page }, info) => {
  const area = await demo(page, info, 'tags')
  const box = area.getByRole('combobox', { name: '自定义标签' })
  await box.click()
  const input = box.locator('input:not([type="hidden"])')
  await input.fill('新标签')
  await input.press('Enter')
  await expect(box).toContainText('新标签')
  await input.fill('新标签')
  await input.press('Enter')
  await expect(box.getByRole('button', { name: '移除 新标签' })).toHaveCount(1)
  await expect(area).toContainText('新标签')
})

// 受控弹层需要父层接受请求，自定义内容与选择项同时可见。
test('[select.browser.advanced] controlled open and custom menu', async ({ page }, info) => {
  const area = await demo(page, info, 'advanced')
  const box = area.getByRole('combobox')
  await area.getByRole('button', { name: '切换弹层' }).click()
  await expect(box).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('listbox')).toContainText(info.project.name === 'docs' ? '自定义菜单尾部' : '菜单尾部内容')
  await page.getByRole('option', { name: info.project.name === 'docs' ? '乙' : '香蕉' }).click()
  await expect(box).toHaveAttribute('aria-expanded', 'false')
})

// 尺寸、错误状态、禁用与加载图标应在浏览器中有真实几何和绘制。
test('[select.browser.variants] sizes and state paint', async ({ page }, info) => {
  const area = await demo(page, info, 'variants')
  const small = area.getByRole('combobox', { name: '小尺寸', exact: true })
  const large = area.getByRole('combobox', { name: '大尺寸', exact: true })
  expect((await small.boundingBox())!.height).toBeLessThan((await large.boundingBox())!.height)
  await expect(area.getByRole('combobox', { name: '错误状态' })).toHaveAttribute('aria-invalid', 'true')
  await expect(area.getByRole('combobox', { name: '禁用选择' })).toHaveAttribute('aria-disabled', 'true')
  await expect(area.getByRole('status', { name: '加载中' })).toBeVisible()
})

// 右侧下拉与加载共用尺寸槽；小、中、大依次为 20、24、28px，中尺寸与清空按钮一致。
test('[select.browser.suffix-size] arrow and loading follow control size', async ({ page }, info) => {
  const area = await demo(page, info, 'variants')
  for (const [name, slotSize, glyphSize] of [['小尺寸', 20, 14], ['中尺寸', 24, 16], ['大尺寸', 28, 18]] as const) {
    const arrow = area.getByRole('combobox', { name, exact: true }).locator('.i-mdi-chevron-down')
    const slot = arrow.locator('..')
    expect((await slot.boundingBox())!.width).toBeCloseTo(slotSize, 0)
    expect((await slot.boundingBox())!.height).toBeCloseTo(slotSize, 0)
    expect((await arrow.boundingBox())!.width).toBeCloseTo(glyphSize, 0)
  }
  const loading = area.getByRole('status', { name: '加载中' })
  expect((await loading.boundingBox())!.width).toBeCloseTo(24, 0)
  expect((await loading.boundingBox())!.height).toBeCloseTo(24, 0)
  await expect(loading.locator('.i-mdi-loading')).toHaveCSS('width', '16px')
  for (const [name, slotSize, glyphSize] of [['小尺寸可清空', 20, 14], ['大尺寸可清空', 28, 18]] as const) {
    const clear = area.getByRole('combobox', { name }).getByRole('button', { name: '清空' })
    expect((await clear.boundingBox())!.width).toBeCloseTo(slotSize, 0)
    expect((await clear.boundingBox())!.height).toBeCloseTo(slotSize, 0)
    expect((await clear.locator('.i-mdi-close').boundingBox())!.width).toBeCloseTo(glyphSize, 0)
  }
})

// 大量选项只挂载视口附近节点，滚动到远端后仍能选择正确的键。
test('[select.browser.virtual] bounded DOM and distant option', async ({ page }, info) => {
  const area = await demo(page, info, 'virtual')
  const box = area.getByRole('combobox')
  await box.click()
  const viewport = page.locator('[data-virtual-list]:visible').last()
  expect(await viewport.getByRole('option').count()).toBeLessThan(20)
  await viewport.evaluate(element => { element.scrollTop = 900 * 32; element.dispatchEvent(new Event('scroll', { bubbles: true })) })
  const label = info.project.name === 'docs' ? '项目 900' : '选项 900'
  await expect(viewport.getByRole('option', { name: label })).toBeVisible()
  await viewport.getByRole('option', { name: label }).click()
  await expect(box).toContainText(label)
})

// Form.Item 的字段在真实浏览器里可选择、提交并重置。
test('[select.browser.form] field submit and reset', async ({ page }, info) => {
  const area = await demo(page, info, 'context')
  const box = area.getByRole('combobox')
  await expect(box).toContainText('苹果')
  await box.click()
  await page.getByRole('option', { name: '香蕉' }).click()
  await area.getByRole('button', { name: info.project.name === 'docs' ? '提交选择' : '提交 Select' }).click()
  await expect(area).toContainText('{"fruit":"banana"}')
  await area.getByRole('button', { name: info.project.name === 'docs' ? '重置选择' : '重置 Select' }).click()
  await expect(box).toContainText('苹果')
})

// 文档开发服务器必须实际绘制输入边框、图标和有尺寸的下拉层。
test('[select.browser.dev] development paint', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs', '开发服务器只执行一次')
  await page.goto(`http://127.0.0.1:5658${process.env.DOCS_BASE ?? '/'}${path}`)
  const area = page.locator('[data-demo="select/basic"]')
  const box = area.getByRole('combobox', { name: '水果' })
  expect((await box.boundingBox())!.height).toBeGreaterThan(20)
  await expect(box).not.toHaveCSS('border-top-width', '0px')
  await box.click()
  const list = page.getByRole('listbox')
  expect((await list.boundingBox())!.width).toBeGreaterThan(100)
  await expect(box.getByRole('button', { name: '清空' }).locator('.i-mdi-close')).not.toHaveCSS('mask-image', 'none')
})

// 静态 HTML 应包含 API 与同文件示例源码，禁用 JavaScript 时仍能阅读。
test('[select.browser.ssr] prerendered API and source', async ({ request }) => {
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  expect(html).toContain('SelectProps API')
  expect(html).toContain('SelectOption API')
  expect(html).toContain('select/virtual')
  expect(html).toContain('filterOption')
})
