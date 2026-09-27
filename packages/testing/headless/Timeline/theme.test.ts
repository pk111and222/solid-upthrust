import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import {
  timelineClass, timelineContentClass, timelineHeaderClass, timelineIconClass, timelineItemClass, timelineRailClass,
  timelineSectionClass, timelineTitleClass, timelineWrapperClass, type TimelineLayout,
} from '../../../components/lib/Timeline/styles'
import {
  progressBodyClass, progressCircleStroke, progressClass, progressIconClass, progressIndicatorClass, progressRailClass,
  progressStepItemClass, progressTrackClass,
} from '../../../components/lib/Progress/styles'

const generate = async (classes: string) => {
  const uno = await createGenerator({ presets: [presetWind4(), presetUpthrust()] })
  return uno.generate(classes, { preflights: false })
}

const deadClasses = async (sets: string[]) => {
  const all = [...new Set(sets.join(' ').split(/\s+/).filter(Boolean))]
  const { matched } = await generate(all.join(' '))
  return all.filter(cls => !matched.has(cls))
}

const LAYOUTS: TimelineLayout[] = [
  'vertical', 'vertical-end', 'alternate', 'alternate-end', 'horizontal', 'horizontal-end', 'horizontal-alternate-start', 'horizontal-alternate-end',
]
const SCHEMES = (['outlined', 'filled', 'custom'] as const).flatMap(v => (['blue', 'red', 'green', 'gray'] as const).map(c => `${v}-${c}` as const))

// Timeline 全部布局 × 配色组合无死类（含 --ut-tl-span 任意值与 [justify-content:end]）。
it('[timeline.theme.classes] every layout and scheme generates', async () => {
  const sets = [timelineClass({ orientation: 'vertical' }), timelineClass({ orientation: 'horizontal' })]
  for (const layout of LAYOUTS) {
    sets.push(
      timelineItemClass({ layout }), timelineWrapperClass({ layout }), timelineSectionClass({ layout }), timelineRailClass({ layout }),
      timelineHeaderClass({ layout, titled: true }), timelineHeaderClass({ layout, titled: false }), timelineTitleClass({ layout }),
      timelineContentClass({ layout, emptyHeader: true }), timelineContentClass({ layout, emptyHeader: false }),
    )
    for (const scheme of SCHEMES) sets.push(timelineIconClass({ layout, scheme }))
  }
  expect(await deadClasses(sets)).toEqual([])
  const { css } = await generate('start-[var(--ut-tl-span)] flex-[1_1_calc(var(--ut-tl-span)-20px)]')
  expect(css).toContain('var(--ut-tl-span)')
})

// Progress 全部变体无死类；进度动画规则来自 preset；描边类生成 stroke。
it('[progress.theme.classes] every variant generates', async () => {
  const sets = [
    ...(['line', 'line-small', 'steps', 'circle', 'inline-circle'] as const).map(kind => progressClass({ kind })),
    ...(['line', 'line-bottom', 'steps', 'circle'] as const).map(kind => progressBodyClass({ kind })),
    progressRailClass({}),
    ...(['normal', 'active', 'exception', 'success'] as const).map(tone => progressTrackClass({ tone })),
    ...(['line', 'line-start', 'inner', 'inner-start', 'inner-end', 'steps', 'circle'] as const).flatMap(kind =>
      (['normal', 'exception', 'success', 'bright'] as const).map(tone => progressIndicatorClass({ kind, tone }))),
    ...(['line', 'line-small', 'circle'] as const).map(size => progressIconClass({ size })),
    progressStepItemClass({ active: true }), progressStepItemClass({ active: false }),
    ...Object.values(progressCircleStroke),
  ]
  expect(await deadClasses(sets)).toEqual([])
  const { css } = await generate('after:animate-progress-active stroke-primary')
  expect(css).toContain('ut-progress-active 2.4s')
  expect(css).toMatch(/stroke:color-mix\(in srgb, rgb\(var\(--upthrust-colors-primary\)/)
})
