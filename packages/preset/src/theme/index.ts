import type { Theme } from '@unocss/preset-uno'
import presetTheme, {type PresetThemeOptions} from 'unocss-preset-theme'
import {getMaterialColor, type MaterialColorOptions} from './colors/material'
import { isString } from '../utils'
import { DEFAULT_PREFIX } from '../index'
import { createGapTheme, type GapTheme} from './gap'

const DEFAULT_PRIMIRY = '#0055ff'

export type ThemeOption = {
  selectors: PresetThemeOptions<any>['selectors']
  prefix: string
  theme: Record<string, Record<string, any>>
  colors?: string | MaterialColorOptions
  defaultGap?: string | number
  gapAlgr?: (value: ThemeOption['defaultGap']) => GapTheme
}

const createTheme = (option?: ThemeOption) => {
  const colorOption = isString(option?.colors) ? {color: option.colors} : option?.colors

  const palette = getMaterialColor({color: DEFAULT_PRIMIRY, ...colorOption})

  const gap = createGapTheme(option?.defaultGap, option?.gapAlgr)

  return [presetTheme({
    theme: {
      // color-palette => light & dark
      dark: {
        colors: palette.dark
      },
      light: {
        colors: palette.light
      },
      
      // custom-theme
      ...option?.theme
    },
    prefix: option?.prefix || DEFAULT_PREFIX,
    selectors: option?.selectors
  }), palette, gap]
}

export default createTheme