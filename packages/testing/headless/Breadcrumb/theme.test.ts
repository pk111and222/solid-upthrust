import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import {
  BREADCRUMB_MENU_LINK_CLASS, BREADCRUMB_OVERLAY_ICON_CLASS,
  breadcrumbItemClass, breadcrumbLinkClass, breadcrumbListClass, breadcrumbOverlayClass, breadcrumbRootClass, breadcrumbSeparatorClass,
} from '../../../components/lib/Breadcrumb/styles'

const deadClasses = async (sets: string[]) => {
  // i-mdi-* 由 preset-icons 生成，测试生成器未加载图标集，排除。
  const all = [...new Set(sets.join(' ').split(/\s+/).filter(Boolean))].filter(cls => !cls.startsWith('i-mdi-'))
  const uno = await createGenerator({ presets: [presetWind4(), presetUpthrust()] })
  const { matched } = await uno.generate(all.join(' '), { preflights: false })
  return all.filter(cls => !matched.has(cls))
}

// Breadcrumb 根 / 列表 / 项 / 链接 / 分隔符 / 下拉触发区的全部变体类都能被 UnoCSS 生成（无死类）。
it('[breadcrumb.theme] no dead classes', async () => {
  const flags = [true, false]
  expect(await deadClasses([
    breadcrumbRootClass(),
    ...flags.map(legacy => breadcrumbListClass({ legacy })),
    ...flags.map(legacy => breadcrumbItemClass({ legacy })),
    ...(['anchor', 'text'] as const).map(kind => breadcrumbLinkClass({ kind })),
    breadcrumbSeparatorClass(),
    breadcrumbOverlayClass(),
    BREADCRUMB_MENU_LINK_CLASS.join(' '),
    BREADCRUMB_OVERLAY_ICON_CLASS.join(' '),
  ])).toEqual([])
})
