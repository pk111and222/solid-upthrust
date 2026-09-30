import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import { spinClassMatrix } from '../../../components/lib/Spin/styles'
import { nextAutoPercent } from '../../../components/lib/Spin'

// Spin 全部变体（四种根模式、三种尺寸、隐藏 / 进度、四个点位、加载中容器）的类都能被 UnoCSS 生成（无死类），且点阵动画规则存在。
it('[spin.theme] no dead classes and dot keyframes', async () => {
  const all = [...new Set(spinClassMatrix().join(' ').split(/\s+/).filter(Boolean))]
  const uno = await createGenerator({ presets: [presetWind4(), presetUpthrust()] })
  const { matched, css } = await uno.generate(all.join(' '))
  expect(all.filter(cls => !matched.has(cls))).toEqual([])
  expect(css).toContain('@keyframes ut-spin-dot-rotate{to{transform:rotate(405deg)}}')
  expect(css).toContain('ut-spin-dot-move 1s linear infinite alternate')
})

// percent='auto' 的估算步进与 antd usePercent 一致：≤30 走 5%，≤70 走 3%，≤96 走 1%，之后停住不到 100。
it('[spin.auto-percent] antd step buckets never reach 100', () => {
  expect(nextAutoPercent(0)).toBeCloseTo(5)
  expect(nextAutoPercent(50)).toBeCloseTo(51.5)
  expect(nextAutoPercent(90)).toBeCloseTo(90.1)
  expect(nextAutoPercent(97)).toBe(97)
  let value = 0
  for (let i = 0; i < 2000; i++) value = nextAutoPercent(value)
  expect(value).toBeLessThan(100)
})
