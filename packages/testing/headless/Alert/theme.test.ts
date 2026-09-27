import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import {
  alertActionsClass, alertBuiltinIconClass, alertClass, alertCloseClass, alertCloseIconClass, alertDescriptionClass,
  alertIconClass, alertSectionClass, alertTitleClass,
} from '../../../components/lib/Alert/styles'

const deadClasses = async (sets: string[]) => {
  const all = [...new Set(sets.join(' ').split(/\s+/).filter(Boolean))]
  const uno = await createGenerator({ presets: [presetWind4(), presetUpthrust()] })
  const { matched } = await uno.generate(all.join(' '), { preflights: false })
  return all.filter(cls => !matched.has(cls))
}

// Alert 全部类型 × 变体、有 / 无描述、banner、离场的类都能被 UnoCSS 生成（无死类）。
it('[alert.theme] no dead classes', async () => {
  const types = ['success', 'info', 'warning', 'error'] as const
  const flags = [true, false]
  expect(await deadClasses([
    ...types.flatMap(type => (['outlined', 'filled'] as const).flatMap(variant => flags.map(withDescription =>
      alertClass({ tone: `${variant}-${type}`, withDescription, banner: withDescription, leaving: !withDescription })))),
    ...types.flatMap(type => flags.map(withDescription => alertIconClass({ type, withDescription }))),
    ...types.map(type => alertDescriptionClass({ type })),
    ...flags.map(withDescription => alertTitleClass({ withDescription })),
    alertBuiltinIconClass, alertSectionClass, alertActionsClass, alertCloseClass, alertCloseIconClass,
  ])).toEqual([])
})
