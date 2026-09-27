import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import {
  resultBodyClass, resultBuiltinIconClass, resultClass, resultExtraClass, resultIconClass, resultSubtitleClass, resultTitleClass,
} from '../../../components/lib/Result/styles'
import { qrCanvasClass, qrCodeClass, qrCoverClass, qrStatusTextClass, qrSvgClass } from '../../../components/lib/QRCode/styles'

const deadClasses = async (sets: string[]) => {
  const all = [...new Set(sets.join(' ').split(/\s+/).filter(Boolean))]
  const uno = await createGenerator({ presets: [presetWind4(), presetUpthrust()] })
  const { matched } = await uno.generate(all.join(' '), { preflights: false })
  return all.filter(cls => !matched.has(cls))
}

// Result 全部状态与 QRCode 有 / 无边框的类都能被 UnoCSS 生成（无死类）。
it('[result-qrcode.theme] no dead classes', async () => {
  const statuses = ['success', 'error', 'info', 'warning', 'image'] as const
  expect(await deadClasses([
    resultClass(), resultBuiltinIconClass, resultTitleClass(), resultSubtitleClass(), resultExtraClass(), resultBodyClass(),
    ...statuses.map(status => resultIconClass({ status })),
    qrCodeClass({ bordered: true }), qrCodeClass({ bordered: false }), qrCoverClass(), qrCanvasClass, qrSvgClass, qrStatusTextClass,
  ])).toEqual([])
})
