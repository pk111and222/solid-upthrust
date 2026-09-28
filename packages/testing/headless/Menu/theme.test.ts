import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { expect, it } from 'vitest'
import presetUpthrust from '../../../preset/src'
import {
  MENU_GROUP_CLASS, MENU_GROUP_LIST_CLASS, MENU_LABEL_CLASS, MENU_NOICON_CLASS, MENU_TOOLTIP_CLASS,
  menuArrowClass, menuContentClass, menuDividerClass, menuExtraClass, menuGroupTitleClass, menuIconClass,
  menuInlineCollapseClass, menuInlineListClass, menuItemClass, menuPopupLayerClass, menuPopupListClass,
  menuRootClass, menuSubmenuClass,
} from '../../../components/lib/Menu/styles'

const deadClasses = async (sets: string[]) => {
  const all = [...new Set(sets.join(' ').split(/\s+/).filter(Boolean))]
  const uno = await createGenerator({ presets: [presetWind4(), presetUpthrust()] })
  const { matched } = await uno.generate(all.join(' '), { preflights: false })
  return all.filter(cls => !matched.has(cls))
}

// Menu 全部主题 × 模式 × 状态、弹层方位、分组 / 分割线 / 收起形态的类都能被 UnoCSS 生成（无死类）。
it('[menu.theme] no dead classes', async () => {
  const themes = ['light', 'dark'] as const
  const flags = [true, false]
  const states = ['idle', 'active', 'selected', 'danger', 'danger-selected', 'disabled'] as const
  const layouts = ['block', 'popup', 'collapsed', 'horizontal'] as const
  const placements = ['bottomLeft', 'bottomRight', 'bottom', 'topLeft', 'topRight', 'top', 'rightTop', 'rightBottom', 'right', 'leftTop', 'leftBottom', 'left'] as const
  expect(await deadClasses([
    ...themes.flatMap(theme => (['vertical', 'inline', 'horizontal'] as const).flatMap(mode => flags.map(collapsed => menuRootClass({ scheme: `${theme}-${mode}`, collapsed })))),
    ...themes.flatMap(theme => (['v', 'h'] as const).flatMap(axis => states.flatMap(state => layouts.map((layout, i) =>
      menuItemClass({ layout, grouped: i % 2 === 0, arrow: i % 2 === 1, tone: `${theme}-${axis}-${state}` }))))),
    ...flags.map(horizontal => menuSubmenuClass({ horizontal })),
    ...flags.map(collapsed => menuIconClass({ collapsed })),
    ...flags.flatMap(withIcon => flags.flatMap(withExtra => flags.map(collapsed => menuContentClass({ withIcon, withExtra, collapsed })))),
    ...themes.map(theme => menuExtraClass({ theme })),
    ...(['down', 'up', 'right'] as const).flatMap(direction => flags.map(collapsed => menuArrowClass({ direction, collapsed }))),
    ...themes.flatMap(theme => (['root', 'inline-sub', 'collapsed'] as const).map(inset => menuGroupTitleClass({ theme, inset }))),
    ...themes.flatMap(theme => flags.map(dashed => menuDividerClass({ theme, dashed }))),
    ...flags.map(open => menuInlineCollapseClass({ open })),
    ...themes.map(theme => menuInlineListClass({ theme })),
    ...flags.flatMap(visible => placements.map(placement => menuPopupLayerClass({ visible, placement }))),
    ...themes.map(theme => menuPopupListClass({ theme })),
    ...[MENU_GROUP_CLASS, MENU_GROUP_LIST_CLASS, MENU_LABEL_CLASS, MENU_NOICON_CLASS, MENU_TOOLTIP_CLASS].map(list => list.join(' ')),
  ])).toEqual([])
})
