import { definePreset, type Preset } from '@unocss/core'
import type { Theme } from '@unocss/preset-uno'
import rules from './rules'
// import shortcuts from './shortcuts'
import createTheme, { ThemeOption } from './theme'
import createShortcuts from './shortcuts'

export const DEFAULT_PREFIX = '--upthrust'
export const DEFAULT_ClASS_PREFIX = 'ut'

export interface PresetUpthrustOptions {
  defaultTheme?: string
  switchedTheme?: ThemeOption
  theme?: Theme
  shortcutsPrefix?: string
}

export const presetUpthrust = definePreset<PresetUpthrustOptions>((options: PresetUpthrustOptions = {}): Preset => {

  const [switchedTheme, palettes, gap] = createTheme(options.switchedTheme)

  const defaultTheme = options.defaultTheme ?? 'light'
  const themeColor = defaultTheme in (options.switchedTheme?.theme ?? {}) ? options.switchedTheme.theme[defaultTheme] : palettes[defaultTheme]
  return {
    name: 'upthrust-unocss-preset',
    theme: {
      color: {...themeColor},
      spacing: {...gap},
    },
    rules,
    shortcuts: createShortcuts(options.shortcutsPrefix),
    ...switchedTheme,
  }
})

export default presetUpthrust