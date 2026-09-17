import { test, expect } from '@playwright/test'
// 示例按真实 Drawer API 统一通过 onClose 关闭，确定和取消均可操作。
test('[drawer.example.close] 默认页脚正确关闭受控抽屉', async ({page}) => {
  await page.goto('Drawer')
  await page.getByRole('button',{name:'打开抽屉',exact:true}).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button',{name:'确定',exact:true}).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByText('最近操作：onClose 关闭')).toBeVisible()
  await page.getByRole('button',{name:'打开抽屉',exact:true}).click()
  await dialog.getByRole('button',{name:'取消',exact:true}).click()
  await expect(dialog).not.toBeVisible()
})
