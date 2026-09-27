import { expect, test } from '@playwright/test'

const path = 'components/data-entry/form/'

for (const mode of ['production', 'development'] as const) {
  // 逐字输入可以捕获 fill 一次赋值发现不了的失焦；覆盖普通、自定义和动态列表。
  test(`[form.browser.typing.${mode}] retains focus through consecutive keystrokes`, async ({ page }) => {
    await page.goto(mode === 'development' ? `http://127.0.0.1:5658/${path}` : path)
    for (const id of ['basic', 'validation', 'custom', 'list', 'list-nested', 'list-complex', 'normalize']) {
      const input = page.locator(`[data-demo="form/${id}"] input`).first()
      await input.fill('')
      await input.click()
      const original = await input.elementHandle()
      await page.keyboard.type('abcdef', { delay: 40 })
      await expect(input).toHaveValue(id === 'normalize' ? 'ABCDEF' : 'abcdef')
      await expect(input).toBeFocused()
      expect(await original!.evaluate(node => node.isConnected && node === document.activeElement)).toBe(true)
    }
  })
}

// 四种反馈图标与输入文字垂直居中，不覆盖清除按钮或字数统计。
test('[form.browser.feedback-affixes] aligns status icons with clear and count', async ({ page }) => {
  await page.goto(path)
  const area = page.locator('[data-demo="form/feedback"]')
  const error = area.getByRole('textbox', { name: '错误' })
  await error.fill('需要修改')
  await expect(area.locator('[data-form-feedback]')).toHaveCount(4)
  for (const label of ['错误', '警告', '成功', '校验中']) {
    const input = area.getByRole('textbox', { name: label })
    const frame = input.locator('..')
    const icon = frame.locator('[data-form-feedback]')
    const inputBox = (await input.boundingBox())!
    const iconBox = (await icon.boundingBox())!
    expect(Math.abs(inputBox.y + inputBox.height / 2 - iconBox.y - iconBox.height / 2)).toBeLessThan(2)
    expect(iconBox.x).toBeGreaterThanOrEqual(inputBox.x + inputBox.width)
  }
  const clearBox = (await area.getByRole('button', { name: 'clear', exact: true }).boundingBox())!
  const feedbackBox = (await error.locator('..').locator('[data-form-feedback]').boundingBox())!
  expect(feedbackBox.x).toBeGreaterThan(clearBox.x + clearBox.width)
  await area.getByRole('button', { name: 'clear', exact: true }).click()
  await expect(error).toHaveValue('')
  await expect(error).toBeFocused()
})

// 布局差异由实际几何验证；同名字段 label 不能跨示例关联。
test('[form.browser.layouts] compares multi-field layouts and unique labels', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto(path)
  const area = page.locator('[data-demo="form/layout"]')
  for (const name of ['水平布局', '垂直布局']) {
    const region = area.getByRole('region', { name, exact: true })
    await expect(region.getByRole('textbox')).toHaveCount(2)
    const input = region.getByRole('textbox', { name: '姓名' })
    const label = region.locator('label').filter({ hasText: '姓名' })
    await label.click()
    await expect(input).toBeFocused()
    const a = (await input.boundingBox())!, b = (await label.boundingBox())!
    if (name === '水平布局') expect(Math.abs(a.y - b.y)).toBeLessThan(2)
    else expect(a.y).toBeGreaterThanOrEqual(b.y + b.height)
  }
  const inline = area.getByRole('region', { name: '内联布局', exact: true })
  const a = (await inline.getByRole('textbox').boundingBox())!
  const b = (await inline.getByRole('combobox').boundingBox())!
  expect(Math.abs(a.y - b.y)).toBeLessThan(2)
  const ids = await page.locator('[data-demo^="form/"] input[id]').evaluateAll(nodes => nodes.map(node => node.id))
  expect(new Set(ids).size).toBe(ids.length)
  const actions = page.locator('[data-demo="form/programmatic"] button')
  const first = (await actions.nth(0).boundingBox())!, second = (await actions.nth(1).boundingBox())!
  expect(second.x - first.x - first.width).toBeGreaterThanOrEqual(8)
})

// 两级列表都可增删，删除首个父项后，剩余电话仍写回正确的数组路径。
test('[form.browser.nested-list] adds and removes both levels and recovers from empty', async ({ page }) => {
  await page.goto(path)
  const area = page.locator('[data-demo="form/list-nested"]')
  await area.getByRole('button', { name: '新增用户', exact: true }).click()
  const users = area.getByRole('region', { name: '联系人', exact: true })
  await expect(users).toHaveCount(2)
  await users.nth(1).getByRole('textbox', { name: '姓名' }).fill('李四')
  await users.nth(1).getByRole('button', { name: '新增电话' }).click()
  // 桌面每行删除按钮与输入框顶部对齐，不能受 Form.Item 下外边距影响。
  for (let index = 0; index < 2; index += 1) {
    const input = (await users.nth(1).getByRole('textbox', { name: '电话' }).nth(index).boundingBox())!
    const remove = (await users.nth(1).getByRole('button', { name: '删除电话' }).nth(index).boundingBox())!
    expect(Math.abs(remove.y - input.y)).toBeLessThan(2)
  }
  await users.nth(1).getByRole('textbox', { name: '电话' }).nth(1).fill('13900000000')
  await users.nth(1).getByRole('button', { name: '删除电话' }).first().click()
  await users.first().getByRole('button', { name: '删除用户' }).click()
  await users.first().getByRole('textbox', { name: '电话' }).fill('13700000000')
  await area.getByRole('button', { name: '提交联系人' }).click()
  await expect(area.locator('output')).toHaveText(JSON.stringify({ users: [{ name: '李四', phones: [{ value: '13700000000' }] }] }))
  await users.first().getByRole('button', { name: '删除用户' }).click()
  await expect(users).toHaveCount(0)
  await area.getByRole('button', { name: '新增用户', exact: true }).click()
  await expect(users).toHaveCount(1)
  await expect(users.getByRole('textbox', { name: '姓名' })).toHaveValue('')
})

// 复杂表单中的区块和明细分别增删，提交必须保留层级和数字值。
test('[form.browser.complex-list] edits nested purchase details and resets', async ({ page }) => {
  await page.goto(path)
  const area = page.locator('[data-demo="form/list-complex"]')
  await area.getByRole('button', { name: '新增区块', exact: true }).click()
  const blocks = area.getByRole('region', { name: '采购区块', exact: true })
  await expect(blocks).toHaveCount(2)
  // 删除明细需与物品输入框对齐，不能落到 Form.Item 的底部留白里。
  const itemInput = (await blocks.first().getByRole('textbox', { name: '物品名称' }).boundingBox())!
  const itemRemove = (await blocks.first().getByRole('button', { name: '删除明细' }).boundingBox())!
  expect(Math.abs(itemRemove.y - itemInput.y)).toBeLessThan(2)
  await blocks.nth(1).getByRole('textbox', { name: '标题', exact: false }).fill('设备')
  await blocks.nth(1).getByRole('button', { name: '新增明细' }).click()
  await blocks.nth(1).getByRole('textbox', { name: '物品名称' }).nth(1).fill('显示器')
  await blocks.nth(1).getByRole('button', { name: '删除明细' }).first().click()
  await blocks.first().getByRole('button', { name: '删除区块' }).click()
  await area.getByRole('button', { name: '提交采购单' }).click()
  await expect(area.locator('output')).toHaveText(JSON.stringify({ sections: [{ title: '设备', items: [{ name: '显示器', quantity: 1 }] }] }))
  await area.getByRole('button', { name: '重置', exact: true }).click()
  await expect(blocks.getByRole('textbox', { name: '标题' })).toHaveValue('办公用品')
  await expect(blocks.getByRole('textbox', { name: '物品名称' })).toHaveValue('笔记本')
})

// 移动后序号与实际数组顺序保持一致。
test('[form.browser.list-order] refreshes row labels after a move', async ({ page }) => {
  await page.goto(path)
  const area = page.locator('[data-demo="form/list-move"]')
  await area.getByRole('button', { name: '下移首行' }).click()
  await expect(area.getByRole('textbox', { name: '第 1 行' })).toHaveValue('乙')
  await expect(area.getByRole('textbox', { name: '第 2 行' })).toHaveValue('甲')
})

// 手机宽度下操作按钮可换行，示例控件不得横向溢出。
test('[form.browser.mobile] keeps form demos within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(path)
  for (const id of ['layout', 'list-nested', 'list-complex', 'custom-list', 'custom', 'search', 'programmatic']) {
    const area = page.locator(`[data-demo="form/${id}"]`)
    await expect(area.locator('input').first()).toBeVisible()
    for (const input of await area.getByRole('textbox').all()) {
      expect((await input.boundingBox())!.width).toBeGreaterThan(100)
    }
    for (const box of await area.locator('input, button').all()) {
      const bounds = (await box.boundingBox())!
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(391)
    }
  }
})

// 注册密码一致时 validator 必须结束，外部实例的 onFinish 能更新展示结果。
test('[form.browser.register] completes matching-password validation', async ({ page }) => {
  await page.goto(path)
  const area = page.locator('[data-demo="form/register"]')
  await area.getByRole('textbox', { name: '邮箱' }).fill('test@example.com')
  await area.locator('input[type="password"]').nth(0).fill('password123')
  await area.locator('input[type="password"]').nth(1).fill('password123')
  await area.getByRole('button', { name: '注册', exact: true }).click()
  await expect(area.locator('output')).toHaveText('注册成功')
})

// 键值行使用相同紧凑布局，删除按钮也需与文本框对齐。
test('[form.browser.custom-list-alignment] aligns the remove action with its inputs', async ({ page }) => {
  await page.goto(path)
  const area = page.locator('[data-demo="form/custom-list"]')
  const input = (await area.getByRole('textbox', { name: '值', exact: true }).boundingBox())!
  const remove = (await area.getByRole('button', { name: '删除', exact: true }).boundingBox())!
  expect(Math.abs(remove.y - input.y)).toBeLessThan(2)
})

for (const width of [1440, 390]) {
  // 校验提示增加字段高度时，同一控制行的数量与操作不能下移；恢复有效值后亦须对齐。
  test(`[form.browser.list-validation-alignment.${width}] keeps controls aligned through validation`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto(path)
    const area = page.locator('[data-demo="form/list-complex"]')
    await area.getByRole('button', { name: '新增明细', exact: true }).click()
    const name = area.getByRole('textbox', { name: '物品名称' }).nth(1)
    const quantity = area.getByRole('spinbutton').nth(1)
    const remove = area.getByRole('button', { name: '删除明细', exact: true }).nth(1)
    const assertAligned = async () => {
      const a = (await name.boundingBox())!
      const b = (await quantity.boundingBox())!
      const c = (await remove.boundingBox())!
      expect(Math.abs(b.y + b.height / 2 - c.y - c.height / 2)).toBeLessThan(2)
      if (width > 640) {
        expect(Math.abs(a.y + a.height / 2 - b.y - b.height / 2)).toBeLessThan(2)
      }
    }
    await assertAligned()
    await area.getByRole('button', { name: '提交采购单', exact: true }).click()
    await expect(area.getByText('请输入物品名称', { exact: true })).toBeVisible()
    await assertAligned()
    await name.fill('文件夹')
    await expect(area.getByText('请输入物品名称', { exact: true })).toHaveCount(0)
    await assertAligned()
    await remove.click()
    await expect(area.getByRole('textbox', { name: '物品名称' })).toHaveCount(1)
  })
}
