import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import { notificationClassMatrix } from '../../../components/lib/Notification/styles'

// Notification 全部变体（六个方位、stack 开关、进出场状态、堆叠层级、四种类型图标色与各结构块）的类都能被 UnoCSS 生成（无死类）。
it('[notification.theme] no dead classes', async () => {
  const all = [...new Set(notificationClassMatrix().join(' ').split(/\s+/).filter(Boolean))]
  const uno = await createGenerator({ presets: [presetWind4(), presetUpthrust()] })
  const { matched } = await uno.generate(all.join(' '))
  expect(all.filter(cls => !matched.has(cls))).toEqual([])
})
