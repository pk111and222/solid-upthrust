import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import { modalClassMatrix } from '../../../components/lib/Modal/styles'
import { drawerClassMatrix } from '../../../components/lib/Drawer/styles'

const deadClasses = async (sets: string[]) => {
  const all = [...new Set(sets.join(' ').split(/\s+/).filter(Boolean))]
  const uno = await createGenerator({ presets: [presetWind4(), presetUpthrust()] })
  const { matched } = await uno.generate(all.join(' '), { preflights: false })
  return all.filter(cls => !matched.has(cls))
}

// Modal 全部变体（可见 / 居中 / 模糊 / 禁用关闭）的类都能被 UnoCSS 生成（无死类）。
it('[modal.theme] no dead classes', async () => {
  expect(await deadClasses(modalClassMatrix())).toEqual([])
})

// Drawer 四个方向 × 显隐 × 拖拽、原地渲染、关闭按钮位置的类都能被 UnoCSS 生成（无死类）。
it('[drawer.theme] no dead classes', async () => {
  expect(await deadClasses(drawerClassMatrix())).toEqual([])
})
