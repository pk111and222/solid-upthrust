import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import { messageClassMatrix } from '../../../components/lib/Message/styles'

// Message 全部变体（三种位置、行收起、进出场状态、五种类型图标色与各结构块）的类都能被 UnoCSS 生成（无死类）。
it('[message.theme] no dead classes', async () => {
  const all = [...new Set(messageClassMatrix().join(' ').split(/\s+/).filter(Boolean))]
  const uno = await createGenerator({ presets: [presetWind4(), presetUpthrust()] })
  const { matched } = await uno.generate(all.join(' '))
  expect(all.filter(cls => !matched.has(cls))).toEqual([])
})
