import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import { floatButtonClassMatrix } from '../../../components/lib/FloatButton/styles'

// FloatButton 全部变体（类型 × 形状 × 独立 / 组内 / 紧凑布局、图标 / 内容、徽标偏移、BackTop 淡入淡出、Group 列表方向 / 菜单定位 / 动效）的类都能被 UnoCSS 生成（无死类）。
it('[float-button.theme] no dead classes', async () => {
  const all = [...new Set(floatButtonClassMatrix().join(' ').split(/\s+/).filter(Boolean))]
  const uno = await createGenerator({ presets: [presetWind4(), presetUpthrust()] })
  const { matched } = await uno.generate(all.join(' '))
  expect(all.filter(cls => !matched.has(cls))).toEqual([])
})
