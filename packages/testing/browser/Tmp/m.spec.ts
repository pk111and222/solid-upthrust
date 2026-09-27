import { test } from '@playwright/test'
import { writeFileSync } from 'node:fs'
test('measure-antd', async ({ page }, info) => {
  test.skip(info.project.name !== 'docs'); test.setTimeout(120000)
  await page.goto('https://ant.design/components/qr-code-cn/', { waitUntil: 'networkidle' })
  const d = await page.evaluate(() => {
    const st = (el: Element | null) => { if (!el) return null; const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return { m: s.margin, p: s.padding, fs: s.fontSize, h: r.height, w: r.width, gap: s.gap, color: s.color } }
    const covers = [...document.querySelectorAll('.ant-qrcode-cover')]
    return covers.slice(0, 3).map(c => ({ html: c.innerHTML.replace(/<svg.*?<\/svg>/g, '<svg/>').slice(0, 300), kids: [...c.querySelectorAll('*')].slice(0, 6).map(e => e.tagName + '.' + (e.getAttribute('class') ?? '').split(' ')[0] + ' ' + JSON.stringify(st(e))) }))
  })
  writeFileSync('/tmp/ad/rq/m2.json', JSON.stringify(d, null, 1))
})
