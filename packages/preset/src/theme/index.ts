import type { Theme } from '@unocss/preset-wind4'
import presetTheme, {type PresetThemeOptions} from 'unocss-preset-theme'
import {getMaterialColor, type MaterialColorOptions} from './colors/material'
import { isString, camelToHyphen } from '../utils'
import { DEFAULT_PREFIX } from '../index'
import { createGapTheme, type GapTheme} from './gap'
import { createSizeTokens, type SizeTokens } from './size'
import { createStyleTokens, type StyleTokens } from './style'

const DEFAULT_PRIMIRY = '#1677ff'

function toKebabKeys(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[camelToHyphen(key)] = value
  }
  return result
}

export type ThemeOption = {
  selectors: PresetThemeOptions<any>['selectors']
  prefix: string
  theme: Record<string, Record<string, any>>
  colors?: string | MaterialColorOptions
  defaultGap?: string | number
  gapAlgr?: (value: ThemeOption['defaultGap']) => GapTheme
  sizeTokens?: Partial<SizeTokens>
  styleTokens?: Partial<StyleTokens>
}

const createTheme = (option?: ThemeOption, defaultTheme = 'light', colors?: Theme['colors']) => {
  const colorOption = isString(option?.colors) ? {color: option.colors} : option?.colors

  const palette = getMaterialColor({color: DEFAULT_PRIMIRY, ...colorOption})

  const gap = option?.gapAlgr
    ? createGapTheme(option?.defaultGap, option?.gapAlgr)
    : undefined

  const sizeTokens = createSizeTokens(option?.sizeTokens)
  const styleTokens = createStyleTokens(option?.styleTokens)

  return [presetTheme({
    theme: {
      dark: {
        colors: { ...toKebabKeys(palette.dark), ...colors }
      },
      light: {
        colors: { ...toKebabKeys(palette.light), ...colors }
      },
      ...option?.theme
    },
    prefix: option?.prefix || DEFAULT_PREFIX,
    selectors: { light: '.light', dark: '.dark', [defaultTheme]: ':root', ...option?.selectors }
  }), { dark: toKebabKeys(palette.dark), light: toKebabKeys(palette.light) }, gap, sizeTokens, styleTokens] as const
}

export default createTheme
export type { SizeTokens } from './size'
export type { StyleTokens } from './style'
