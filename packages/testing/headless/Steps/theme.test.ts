import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import {
  STEP_PROGRESS_CLASS, STEP_SUBTITLE_CLASS, STEP_VERTICAL_COLUMN_CLASS,
  stepBodyClass, stepContentClass, stepDotClass, stepDotWrapClass, stepGlyphClass, stepIconClass,
  stepItemClass, stepRailClass, stepTitleClass, stepsRootClass,
} from '../../../components/lib/Steps/styles'

const deadClasses = async (sets: string[]) => {
  // 图标类（i-mdi-*）由 preset-icons 生成，本生成器不含该 preset；group 是 group-hover: 的标记类，本身不产生 CSS。二者排除在外。
  const all = [...new Set(sets.join(' ').split(/\s+/).filter(Boolean))].filter(cls => !cls.startsWith('i-mdi-') && cls !== 'group')
  const uno = await createGenerator({ presets: [presetWind4(), presetUpthrust()] })
  const { matched } = await uno.generate(all.join(' '), { preflights: false })
  return all.filter(cls => !matched.has(cls))
}

// Steps 全部布局 × 尺寸 × 状态 × 变体（filled / outlined / 自定义图标）、点状、连接线与内容区的类都能被 UnoCSS 生成（无死类）。
it('[steps.theme] no dead classes', async () => {
  const flags = [true, false]
  const statuses = ['wait', 'process', 'finish', 'error'] as const
  const sizes = ['default', 'small'] as const
  expect(await deadClasses([
    ...(['horizontal', 'vertical'] as const).map(orientation => stepsRootClass({ orientation })),
    ...(['inline', 'stack', 'vertical'] as const).flatMap(layout => flags.flatMap(pad => flags.flatMap(fill => flags.flatMap(clickable => flags.map(disabled =>
      stepItemClass({ layout, pad, fill, clickable, disabled })))))),
    ...(['filled', 'outlined', 'custom'] as const).flatMap(variant => statuses.flatMap(status => sizes.flatMap(size => flags.map(hover =>
      stepIconClass({ size, tone: `${variant}-${status}`, hover }))))),
    ...(['check', 'close', 'number'] as const).map(glyph => stepGlyphClass({ glyph })),
    STEP_PROGRESS_CLASS.join(' '), STEP_SUBTITLE_CLASS.join(' '), STEP_VERTICAL_COLUMN_CLASS.join(' '),
    ...(['stack', 'vertical-default', 'vertical-small'] as const).map(layout => stepDotWrapClass({ layout })),
    ...statuses.flatMap(tone => (['default', 'default-current', 'small', 'small-current'] as const).map(size => stepDotClass({ tone, size }))),
    ...(['finish', 'rest'] as const).flatMap(tone => (['inline-default', 'inline-small', 'stack-default', 'stack-small', 'dot', 'vertical'] as const).map(layout => stepRailClass({ tone, layout }))),
    ...(['inline', 'stack', 'dot', 'vertical', 'vertical-last'] as const).map(layout => stepBodyClass({ layout })),
    ...(['inline-default', 'inline-small', 'stack-default', 'stack-small', 'vertical-default', 'vertical-small'] as const).flatMap(layout => statuses.flatMap(tone => flags.map(hover =>
      stepTitleClass({ layout, tone, hover })))),
    ...statuses.flatMap(tone => (['inline', 'stack', 'vertical'] as const).map(layout => stepContentClass({ tone, layout }))),
  ])).toEqual([])
})

// filled 默认视觉对齐 antd 6：wait 浅灰底、process 主色实心、finish / error 10% 浅色底；outlined 保留描边外观。
it('[steps.theme.tones] filled and outlined icon tones', () => {
  expect(stepIconClass({ tone: 'filled-wait' })).toContain('bg-on-surface/6')
  expect(stepIconClass({ tone: 'filled-process' })).toContain('bg-primary')
  expect(stepIconClass({ tone: 'filled-finish' })).toContain('bg-primary/10')
  expect(stepIconClass({ tone: 'filled-error' })).toContain('bg-error/10')
  expect(stepIconClass({ tone: 'outlined-wait' })).toContain('border-on-surface/25')
  expect(stepIconClass({ tone: 'outlined-finish' })).toContain('border-primary')
  // 连接线：finish 项之后为主色，其余为 outline-variant。
  expect(stepRailClass({ tone: 'finish' })).toContain('border-primary')
  expect(stepRailClass({ tone: 'rest' })).toContain('border-outline-variant')
})
