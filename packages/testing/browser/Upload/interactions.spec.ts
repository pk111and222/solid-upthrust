import { expect, test, type Page, type TestInfo } from '@playwright/test'

const path = 'components/data-entry/upload/'

async function demo(page: Page, info: TestInfo, id: string) {
  await page.goto(info.project.name === 'docs' ? path : 'Upload')
  return page.locator(info.project.name === 'docs' ? `[data-demo="upload/${id}"]` : 'body')
}

test('[upload.browser.basic] selects a file and shows its completed state', async ({ page }, info) => {
  const area = await demo(page, info, 'basic')
  const input = area.locator('input[type="file"]').first()
  await input.setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') })
  await expect(area.getByText('notes.txt', { exact: true })).toBeVisible()
  if (info.project.name === 'docs') await expect(area.locator('output')).toContainText('"status":"done"')
  else await expect(area).toContainText('notes.txt')
})

test('[upload.browser.constraints] drops vetoed files and supports custom retry actions', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  const area = await demo(page, info, 'constraints')
  await area.locator('input[type="file"]').setInputFiles([
    { name: 'reject.txt', mimeType: 'text/plain', buffer: Buffer.from('no') },
    { name: 'keep.txt', mimeType: 'text/plain', buffer: Buffer.from('yes') },
  ])
  await expect(area.getByText('reject.txt: error', { exact: true })).toHaveCount(0)
  await expect(area.getByText('keep.txt: error', { exact: true })).toBeVisible()
  await area.getByRole('button', { name: '重试 keep.txt' }).click()
  await expect(area.getByText('keep.txt: done', { exact: true })).toBeVisible()
})

test('[upload.browser.dragger] accepts matching drops and reports rejected files', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  const area = await demo(page, info, 'dragger')
  const zone = area.getByRole('button')
  await zone.dispatchEvent('dragover', { dataTransfer: await page.evaluateHandle(() => new DataTransfer()) })
  await expect(zone).toHaveClass(/border-primary/)
  await zone.dispatchEvent('dragleave')

  await zone.evaluate((element) => {
    const transfer = new DataTransfer()
    transfer.items.add(new File(['ok'], 'accepted.txt', { type: 'text/plain' }))
    transfer.items.add(new File(['no'], 'rejected.png', { type: 'image/png' }))
    element.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }))
  })
  await expect(area.locator('output').nth(0)).toHaveText('已接收：accepted.txt')
  await expect(area.locator('output').nth(1)).toHaveText('已拒绝：rejected.png')
})

test('[upload.browser.manual] starts deferred uploads only after confirmation', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  const area = await demo(page, info, 'manual')
  await area.locator('input[type="file"]').setInputFiles({ name: 'later.txt', mimeType: 'text/plain', buffer: Buffer.from('later') })
  await expect(area.locator('output')).toContainText('later.txt: 待上传')
  await expect(area.locator('output')).not.toContainText('uploading')
  await expect(area.locator('.i-mdi-loading')).toHaveCount(0)
  await area.getByRole('button', { name: '开始上传' }).click()
  await expect(area.locator('output')).toContainText('later.txt: done')
})

test('[upload.browser.form] submits and resets the Upload field value', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs')
  const area = await demo(page, info, 'form')
  const form = area.locator('form').last()
  await form.locator('input[type="file"]').setInputFiles({ name: 'attachment.txt', mimeType: 'text/plain', buffer: Buffer.from('data') })
  await expect(area.getByText('attachment.txt', { exact: true })).toBeVisible()
  await form.getByRole('button', { name: '提交附件' }).click()
  await expect(area.locator('output').last()).toContainText('"attachments":[{"uid"')
  await form.getByRole('button', { name: '重置附件' }).click()
  await expect(area.getByText('attachment.txt', { exact: true })).toHaveCount(0)
})

test('[upload.browser.ssr] serves static Upload API and source without JavaScript', async ({ request }, info) => {
  test.skip(info.project.name !== 'docs')
  const response = await request.get(path)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  expect(html).toContain('UploadProps API')
  expect(html).toContain('upload/dragger')
  expect(html).toContain('onDropReject')
})
