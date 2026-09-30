import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import { popconfirmClassMatrix } from '../../../components/lib/Popconfirm/styles'

// Popconfirm 全部变体（12 个方向 × 显隐、标题粗细、四向箭头与各结构块）的类都能被 UnoCSS 生成（无死类）。
it('[popconfirm.theme] no dead classes', async () => {
  const all = [...new Set(popconfirmClassMatrix().join(' ').split(/\s+/).filter(Boolean))]
  const uno = await createGenerator({ presets: [presetWind4(), presetUpthrust()] })
  const { matched } = await uno.generate(all.join(' '))
  expect(all.filter(cls => !matched.has(cls))).toEqual([])
})
