import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import { anchorContainerClass, anchorInkClass, anchorLinkClass, anchorTitleClass, anchorWrapperClass } from '../../../components/lib/Anchor/styles'

const deadClasses = async (sets: string[]) => {
  const all = [...new Set(sets.join(' ').split(/\s+/).filter(Boolean))]
  const uno = await createGenerator({ presets: [presetWind4(), presetUpthrust()] })
  const { matched } = await uno.generate(all.join(' '), { preflights: false })
  return all.filter(cls => !matched.has(cls))
}

// Anchor 全部方向 × 布局 × 状态的类都能被 UnoCSS 生成（无死类），包括轨道 ::before、ink 过渡与 only-child 变体。
it('[anchor.theme] no dead classes', async () => {
  const directions = ['vertical', 'horizontal'] as const
  expect(await deadClasses([
    ...directions.map(direction => anchorWrapperClass({ direction })),
    ...directions.map(direction => anchorContainerClass({ direction })),
    ...(['vertical', 'nested', 'horizontal'] as const).map(layout => anchorLinkClass({ layout })),
    ...(['idle', 'active'] as const).flatMap(state => directions.map(spacing => anchorTitleClass({ state, spacing }))),
    ...directions.flatMap(direction => [true, false].map(visible => anchorInkClass({ direction, visible }))),
  ])).toEqual([])
})

// 回归：每个链接不再自带 border-l-2（旧实现激活项同时画自身边框与 ink，出现双重指示条）。
it('[anchor.theme.singleIndicator] links carry no per-item border', () => {
  for (const layout of ['vertical', 'nested', 'horizontal'] as const) expect(anchorLinkClass({ layout })).not.toMatch(/border-/)
  for (const state of ['idle', 'active'] as const) expect(anchorTitleClass({ state, spacing: 'vertical' })).not.toMatch(/border-/)
})
