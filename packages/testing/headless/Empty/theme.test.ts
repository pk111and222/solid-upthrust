import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import { emptyClass, emptyDescriptionClass, emptyFooterClass, emptyImageClass, emptyImageColors } from '../../../components/lib/Empty/styles'
import { statisticAffixClass, statisticClass, statisticContentClass, statisticHeaderClass, statisticSkeletonClass, statisticTitleClass, statisticValueClass } from '../../../components/lib/Statistic/styles'

const generate = async (classes: string) => {
  const uno = await createGenerator({ presets: [presetWind4(), presetUpthrust()] })
  return (await uno.generate(classes, { preflights: false }))
}

// 插画颜色类全部能生成：color-mix 混出实色并引用主题变量（SVG 属性直接写变量会失效）。
it('[empty.theme.colors] illustration color utilities generate', async () => {
  const { css, matched } = await generate(Object.values(emptyImageColors).join(' '))
  for (const cls of Object.values(emptyImageColors)) expect(matched.has(cls)).toBe(true)
  expect(css).toMatch(/fill:color-mix\(in oklab, color-mix\(in srgb,rgb\(var\(--upthrust-colors-on-surface\)\) 15%/)
  expect(css).toMatch(/stroke:color-mix\(in oklab, color-mix\(in srgb,rgb\(var\(--upthrust-colors-on-surface\)\) 15%/)
})

// Empty 与 Statistic 的布局类无死类；合并后文字大小与颜色不互相吞掉。
it('[empty.theme.classes] layout classes generate and survive merging', async () => {
  const sets = [
    emptyClass({ simple: true }), emptyImageClass({ simple: false }), emptyImageClass({ simple: true }), emptyDescriptionClass({}), emptyFooterClass({}),
    statisticClass({}), statisticHeaderClass({}), statisticTitleClass({}), statisticContentClass({}), statisticValueClass({}),
    statisticAffixClass({ side: 'prefix' }), statisticAffixClass({ side: 'suffix' }), statisticSkeletonClass({}),
  ]
  const all = [...new Set(sets.join(' ').split(/\s+/))]
  const { matched } = await generate(all.join(' '))
  expect(all.filter(cls => !matched.has(cls))).toEqual([])
  expect(emptyClass({ simple: true }).split(' ')).toEqual(expect.arrayContaining(['text-[14px]', 'text-center', 'text-on-surface/45', 'my-[32px]']))
  expect(statisticContentClass({}).split(' ')).toEqual(expect.arrayContaining(['text-on-surface', 'text-[24px]']))
  expect(statisticTitleClass({}).split(' ')).toEqual(expect.arrayContaining(['text-on-surface/45', 'text-[14px]']))
})
