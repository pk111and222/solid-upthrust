import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import { tourClassMatrix } from '../../../components/lib/Tour/styles'

// Tour 全部变体（default / primary × 面板 / 关闭 / 按钮 / 箭头四边、指示点四态、cover / header / footer / mask）的类都能被 UnoCSS 生成（无死类）。
it('[tour.theme] no dead classes', async () => {
  const all = [...new Set(tourClassMatrix().join(' ').split(/\s+/).filter(Boolean))]
  const uno = await createGenerator({ presets: [presetWind4(), presetUpthrust()] })
  const { matched } = await uno.generate(all.join(' '))
  expect(all.filter(cls => !matched.has(cls))).toEqual([])
})
