import { describe, expect, it } from 'vitest'
import { resolveTagClosable, resolveTagColor, tagLightBackground } from '../../../competence/src/tag'
import { PRESET_COLORS, PRESET_STATUS_COLORS, isPresetColor, isPresetStatusColor } from '../../../competence/src/presetColors'

describe('Tag 颜色与变体归一（antd 6.6.5 useColor）', () => {
  // 默认 filled；显式 variant 优先；-inverse 旧写法转为 solid 并去掉后缀。
  it('[tag.variant.precedence] variant > inverse > filled default', () => {
    expect(resolveTagColor({}).variant).toBe('filled')
    expect(resolveTagColor({ bordered: true }).variant).toBe('filled')
    expect(resolveTagColor({ bordered: false }).variant).toBe('filled')
    expect(resolveTagColor({ color: 'red-inverse' })).toMatchObject({ variant: 'solid', color: 'red', isPreset: true })
    expect(resolveTagColor({ color: 'red-inverse', variant: 'outlined' })).toMatchObject({ variant: 'outlined', color: 'red' })
    expect(resolveTagColor({ variant: 'outlined', bordered: false }).variant).toBe('outlined')
  })

  // solid 未设颜色时使用 default 色；其他变体保持 undefined。
  it('[tag.variant.solid-default] solid without color becomes default', () => {
    expect(resolveTagColor({ variant: 'solid' })).toMatchObject({ color: 'default', isStatus: true, isPreset: false })
    expect(resolveTagColor({ variant: 'filled' }).color).toBeUndefined()
  })

  // 13 个预设色板与 5 个状态色都走类名，不产生内联样式。
  it('[tag.color.preset] presets and statuses never inline', () => {
    expect(PRESET_COLORS).toHaveLength(13)
    expect(PRESET_STATUS_COLORS).toEqual(['success', 'processing', 'error', 'default', 'warning'])
    for (const color of [...PRESET_COLORS, ...PRESET_STATUS_COLORS]) {
      for (const variant of ['filled', 'outlined', 'solid'] as const) {
        const state = resolveTagColor({ color, variant })
        expect(state.customStyle).toEqual({})
        expect(state.isPreset || state.isStatus).toBe(true)
      }
    }
    expect(isPresetColor('pink')).toBe(true)
    expect(isPresetColor('pink-inverse')).toBe(false)
    expect(isPresetStatusColor('default')).toBe(true)
    expect(isPresetColor(undefined)).toBe(false)
  })

  // 自定义色：filled 为 95% 亮度底 + 原色字；outlined 额外原色边；solid 只设底色。
  it('[tag.color.custom] custom color pairs per variant', () => {
    expect(resolveTagColor({ color: '#f50' }).customStyle).toEqual({ 'background-color': '#ffeee5', color: '#f50' })
    expect(resolveTagColor({ color: '#f50', variant: 'outlined' }).customStyle).toEqual({ 'background-color': '#ffeee5', color: '#f50', 'border-color': '#f50' })
    expect(resolveTagColor({ color: '#f50', variant: 'solid' }).customStyle).toEqual({ 'background-color': '#f50' })
    expect(resolveTagColor({ color: '#f50' })).toMatchObject({ isPreset: false, isStatus: false, color: '#f50' })
  })

  // 浅色底保持色相与饱和度：rgb/hsl 输入、灰色、透明度与无法解析的命名色。
  it('[tag.color.light] light background derivation', () => {
    expect(tagLightBackground('rgb(45, 183, 245)')).toBe(tagLightBackground('#2db7f5'))
    // 与 FastColor 相同的浮点路径：0.95 - 0.05 = 0.8999… → 229（e5）
    expect(tagLightBackground('hsl(0, 100%, 50%)')).toBe('#ffe5e5')
    expect(tagLightBackground('#808080')).toBe('#f2f2f2')
    expect(tagLightBackground('rgba(255, 0, 0, 0.5)')).toBe('#ffe5e580')
    expect(tagLightBackground('teal')).toBe('color-mix(in srgb, teal 10%, #fff)')
  })
})

describe('Tag 关闭按钮判定（antd useClosable）', () => {
  // 两者都未设置时不可关闭；closable=true 使用默认图标。
  it('[tag.closable.defaults] unset and boolean closable', () => {
    expect(resolveTagClosable(undefined, undefined)).toBe(false)
    expect(resolveTagClosable(true, undefined)).toEqual({ closeIcon: undefined, ariaLabel: undefined })
    expect(resolveTagClosable(false, 'icon')).toBe(false)
  })

  // 未设 closable 时：图标即表示可关闭，true 用默认图标，false/null 隐藏。
  it('[tag.closable.icon-only] closeIcon alone controls visibility', () => {
    expect(resolveTagClosable(undefined, 'X')).toEqual({ closeIcon: 'X', ariaLabel: undefined })
    expect(resolveTagClosable(undefined, true)).toEqual({ closeIcon: undefined, ariaLabel: undefined })
    expect(resolveTagClosable(undefined, false)).toBe(false)
    expect(resolveTagClosable(undefined, null)).toBe(false)
  })

  // closable=true 时 closeIcon 为 false/null 不再隐藏，仍显示默认图标。
  it('[tag.closable.true-wins] explicit closable beats a hiding closeIcon', () => {
    expect(resolveTagClosable(true, false)).toEqual({ closeIcon: undefined, ariaLabel: undefined })
    expect(resolveTagClosable(true, null)).toEqual({ closeIcon: undefined, ariaLabel: undefined })
  })

  // 对象形式：对象内图标优先于 closeIcon，并携带 aria-label；未给图标时回退 closeIcon。
  it('[tag.closable.object] object config icon and label', () => {
    expect(resolveTagClosable({ closeIcon: 'A', 'aria-label': '删除' }, 'B')).toEqual({ closeIcon: 'A', ariaLabel: '删除' })
    expect(resolveTagClosable({ 'aria-label': '删除' }, 'B')).toEqual({ closeIcon: 'B', ariaLabel: '删除' })
    expect(resolveTagClosable({}, undefined)).toEqual({ closeIcon: undefined, ariaLabel: undefined })
  })
})
