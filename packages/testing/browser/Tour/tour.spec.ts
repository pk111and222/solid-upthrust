import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test'
import { paintedColor } from '../../utils/color-browser'

const path = 'components/feedback/tour/'
async function demo(page: Page, info: TestInfo, docsId: string, exampleId: string) {
  const docs = info.project.name === 'docs'
  if (!page.url().includes(docs ? path : '/Tour')) await page.goto(docs ? path : 'Tour')
  const area = page.locator(docs ? `[data-demo="tour/${docsId}"]` : `[data-tour-demo="${exampleId}"]`)
  await expect(area.getByText('示例加载中…')).toHaveCount(0)
  await area.scrollIntoViewIfNeeded()
  return area
}
const open = async (area: Locator, info: TestInfo, exampleId: string) => {
  await (info.project.name === 'docs' ? area.getByRole('button').first() : area.locator(`[data-tour-open="${exampleId}"]`)).click()
}
const box = (locator: Locator) => locator.evaluate(el => {
  const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }
})
const near = (actual: number, expected: number, tolerance = 1) => expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThanOrEqual(tolerance)
const part = (page: Page, name: string) => page.locator(`[data-tour-part="${name}"]`)
const css = (locator: Locator, prop: string) => locator.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop)

// 几何：面板 520 宽、section 8px 圆角 + 阴影；关闭按钮 22×22 距右上 16；header 上 16、左 16；指示点 6×6 间距 6；按钮 small（24 高）；
// 面板距高亮区 12px（半箭头 8 + marginXXS 4，即距目标 18px；空间不足时翻到上方），箭头水平居中指向目标；遮罩镂空 = 目标外扩 6、圆角 2；打开期间 body 滚动锁定。
test('[tour.browser.geometry] panel, arrow and mask hole', async ({ page }, info) => {
  const area = await demo(page, info, 'basic', 'basic')
  await open(area, info, 'basic')
  const root = part(page, 'root'), section = part(page, 'section')
  await expect(root).toBeVisible()
  const target = await box(area.getByRole('button', { name: '上传' }))
  const r = await box(root), s = await box(section)
  near(r.width, 520)
  expect(await css(section, 'border-top-left-radius')).toBe('8px')
  expect(await css(section, 'box-shadow')).not.toBe('none')
  const close = await box(part(page, 'close'))
  near(close.width, 22); near(close.height, 22)
  near(s.x + s.width - (close.x + close.width), 16); near(close.y - s.y, 16)
  const cover = await box(part(page, 'cover'))
  near(cover.y, s.y); expect(await css(part(page, 'cover'), 'padding-top')).toBe('46px')
  expect(await css(part(page, 'header'), 'padding')).toBe('16px 16px 8px')
  const dots = part(page, 'indicator')
  await expect(dots).toHaveCount(3)
  const d0 = await box(dots.nth(0)), d1 = await box(dots.nth(1))
  near(d0.width, 6); near(d0.height, 6); near(d1.x - (d0.x + d0.width), 6)
  near((await box(part(page, 'next'))).height, 24)
  const placement = await root.getAttribute('data-tour-placement')
  expect(['bottom', 'top']).toContain(placement)
  if (placement === 'bottom') near(r.y - (target.y + target.height), 18, 1.5)
  else near(target.y - (r.y + r.height), 18, 1.5)
  const arrow = await box(part(page, 'arrow'))
  near(arrow.x + arrow.width / 2, target.x + target.width / 2, 1.5)
  const hole = part(page, 'hole')
  expect(await hole.evaluate(el => ['x', 'y', 'width', 'height', 'rx'].map(a => Number(el.getAttribute(a))))).toEqual([target.x - 6, target.y - 6, target.width + 12, target.height + 12, 2])
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await page.screenshot({ path: info.outputPath('geometry.png') })
})

// 点击穿透：高亮区中心命中目标本身（遮罩容器 pointer-events none），高亮区外命中透明覆盖矩形；点击遮罩不关闭。
test('[tour.browser.hit] hole passes clicks through, cover rects block the rest', async ({ page }, info) => {
  const area = await demo(page, info, 'basic', 'basic')
  await open(area, info, 'basic')
  await expect(part(page, 'root')).toBeVisible()
  const target = await box(area.getByRole('button', { name: '上传' }))
  const hit = (x: number, y: number) => page.evaluate(([x, y]) => {
    const el = document.elementFromPoint(x, y); return el?.getAttribute('data-tour-part') ?? el?.closest('button')?.textContent ?? el?.tagName
  }, [x, y])
  expect(await hit(target.x + target.width / 2, target.y + target.height / 2)).toBe('上传')
  expect(await hit(5, 5)).toBe('cover-rect')
  await page.mouse.click(5, 5)
  await expect(part(page, 'root')).toBeVisible()
})

// 键盘：→ 进入第 2 步（标题“保存”，镂空移到保存按钮，第 2 个指示点激活）、← 返回；Escape 关闭并解除滚动锁定。
test('[tour.browser.keyboard] arrows navigate and Escape closes', async ({ page }, info) => {
  const area = await demo(page, info, 'basic', 'basic')
  await open(area, info, 'basic')
  await expect(part(page, 'title')).toHaveText('上传文件')
  await page.keyboard.press('ArrowRight')
  await expect(part(page, 'title')).toHaveText('保存')
  await expect(part(page, 'indicator').nth(1)).toHaveAttribute('data-tour-active', 'true')
  const save = await box(area.getByRole('button', { name: '保存' }))
  // 镂空 x 属性立即更新，但 CSS 过渡（all motionDurationSlow）让渲染值渐变：用 getBBox 等到过渡落定。
  await expect.poll(() => part(page, 'hole').evaluate(el => Math.round((el as SVGRectElement).getBBox().x))).toBe(Math.round(save.x - 6))
  await expect(part(page, 'prev')).toHaveText('上一步')
  await page.screenshot({ path: info.outputPath('step-2.png') })
  await page.keyboard.press('ArrowLeft')
  await expect(part(page, 'title')).toHaveText('上传文件')
  await page.keyboard.press('Escape')
  await expect(part(page, 'root')).toHaveCount(0)
  await expect(part(page, 'mask')).toHaveCount(0)
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
})

// 按钮流程：下一步 → 上一步 → 末步主按钮“结束导览”，点击后关闭。
test('[tour.browser.finish] buttons walk to the end', async ({ page }, info) => {
  const area = await demo(page, info, 'basic', 'basic')
  await open(area, info, 'basic')
  await part(page, 'next').click(); await expect(part(page, 'title')).toHaveText('保存')
  await part(page, 'prev').click(); await expect(part(page, 'title')).toHaveText('上传文件')
  await part(page, 'next').click(); await part(page, 'next').click()
  await expect(part(page, 'next')).toHaveText('结束导览')
  await part(page, 'next').click()
  await expect(part(page, 'root')).toHaveCount(0)
})

// primary 非模态：无遮罩 SVG；section 为主色、6px 圆角、白字；下一步白底主色字；激活指示点白色、其余白 15%。
test('[tour.browser.primary] primary colors without mask', async ({ page }, info) => {
  const area = await demo(page, info, 'non-modal', 'primary')
  await open(area, info, 'primary')
  const section = part(page, 'section')
  await expect(section).toBeVisible()
  await expect(part(page, 'mask').locator('svg')).toHaveCount(0)
  const paint = paintedColor
  expect(await css(section, 'border-top-left-radius')).toBe('6px')
  await expect.poll(() => paint(part(page, 'next'), 'background-color')).toBe('rgb(255, 255, 255)')
  expect(await paint(section, 'color')).toBe('rgb(255, 255, 255)')
  expect(await paint(part(page, 'indicator').nth(0), 'background-color')).toBe('rgb(255, 255, 255)')
  expect(await paint(part(page, 'indicator').nth(1), 'background-color')).toBe('rgba(255, 255, 255, 0.15)')
  // section 底色 = 下一步按钮文字色 = 主色。
  expect(await paint(section, 'background-color')).toBe(await paint(part(page, 'next'), 'color'))
  expect(await paint(section, 'background-color')).not.toBe('rgb(255, 255, 255)')
  await page.screenshot({ path: info.outputPath('primary.png') })
  await page.keyboard.press('Escape')
})

// 位置：docs 第一步无目标居中（placement center，无箭头）；example 右边缘目标 placement right 翻转到 left，箭头在面板右边。
test('[tour.browser.placement] center and flip', async ({ page }, info) => {
  const docs = info.project.name === 'docs'
  const area = await demo(page, info, 'placement', 'placement')
  await open(area, info, 'placement')
  const root = part(page, 'root')
  await expect(root).toBeVisible()
  const vp = page.viewportSize()!
  if (docs) {
    await expect(root).toHaveAttribute('data-tour-placement', 'center')
    await expect(part(page, 'arrow')).toHaveCount(0)
    const r = await box(root)
    near(r.x + r.width / 2, vp.width / 2, 1.5); near(r.y + r.height / 2, vp.height / 2, 1.5)
  } else {
    await expect(root).toHaveAttribute('data-tour-placement', 'left')
    const target = await box(area.getByRole('button', { name: '右边缘目标' }))
    const r = await box(root), arrow = await box(part(page, 'arrow'))
    near(target.x - (r.x + r.width), 18, 1.5)
    near(arrow.x + arrow.width / 2, r.x + r.width, 1.5)
    near(arrow.y + arrow.height / 2, target.y + target.height / 2, 1.5)
  }
  await page.screenshot({ path: info.outputPath('placement.png') })
  await page.keyboard.press('Escape')
})
