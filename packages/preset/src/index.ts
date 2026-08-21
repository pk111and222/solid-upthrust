import { definePreset, type Preset, type PresetFactory } from '@unocss/core'
import { presetWind4, type Theme } from '@unocss/preset-wind4'
import { createRules } from './rules'
import createTheme, { type ThemeOption } from './theme'
import createShortcuts from './shortcuts'
import { extractorIcons } from './extractors'
import { type SizeTokens } from './theme/size'
import { type StyleTokens } from './theme/style'

export const DEFAULT_PREFIX = '--upthrust'
export const DEFAULT_ClASS_PREFIX = 'ut'

export interface PresetUpthrustOptions {
  defaultTheme?: string
  switchedTheme?: ThemeOption
  theme?: Theme
  shortcutsPrefix?: string
}

const createPreset: PresetFactory<Theme, PresetUpthrustOptions> = (options = {}) => {

  const [switchedTheme, palettes, gap, sizeTokens, styleTokens] = createTheme(options.switchedTheme)

  // preset-wind4's default radius/shadow scales — spread so our overrides only
  // replace the spec entries and keep wind4's remaining keys (rounded-full,
  // shadow-xl, ...) intact.
  const wind4Defaults = presetWind4().theme ?? {}

  const defaultTheme = options.defaultTheme ?? 'light'
  const themeColor = options.switchedTheme?.theme?.[defaultTheme] ?? (defaultTheme === 'dark' ? palettes.dark : palettes.light)

  const spacing: Record<string, string> = {
    ...(gap ?? {}),
    'xxs': sizeTokens.paddingXXS,
    'xs': sizeTokens.paddingXS,
    'sm': sizeTokens.paddingSM,
    'md': sizeTokens.padding,
    'lg': sizeTokens.paddingLG,
    'xl': sizeTokens.paddingXL,
  }

  return {
    ...switchedTheme,
    name: 'upthrust-unocss-preset',
    theme: {
      color: {...themeColor},
      spacing,
      text: {
        'heading-1': { fontSize: sizeTokens.fontSizeHeading1, lineHeight: '1.2105' },
        'heading-2': { fontSize: sizeTokens.fontSizeHeading2, lineHeight: '1.2667' },
        'heading-3': { fontSize: sizeTokens.fontSizeHeading3, lineHeight: '1.3333' },
        'heading-4': { fontSize: sizeTokens.fontSizeHeading4, lineHeight: '1.4' },
        'heading-5': { fontSize: sizeTokens.fontSizeHeading5, lineHeight: '1.5' },
        'body': { fontSize: sizeTokens.fontSize, lineHeight: sizeTokens.lineHeight },
        'body-sm': { fontSize: sizeTokens.fontSizeSM, lineHeight: sizeTokens.lineHeight },
        'body-lg': { fontSize: sizeTokens.fontSizeLG, lineHeight: '1.5' },
      },
      // Theme keys must match preset-wind4's rule lookups: `rounded-*` reads
      // theme.radius (NOT borderRadius) and `shadow-*` reads theme.shadow
      // (NOT boxShadow). Writing the camelCase keys made our 2/4/6/8px scale
      // invisible — utilities silently resolved to wind4's own defaults.
      radius: {
        ...wind4Defaults.radius,
        'xs': styleTokens.borderRadiusXS,
        'sm': styleTokens.borderRadiusSM,
        DEFAULT: styleTokens.borderRadius,
        'lg': styleTokens.borderRadiusLG,
      },
      shadow: {
        ...wind4Defaults.shadow,
        DEFAULT: styleTokens.boxShadow,
        'secondary': styleTokens.boxShadowSecondary,
        'tertiary': styleTokens.boxShadowTertiary,
      },
    },
    rules: [...(switchedTheme.rules || []), ...createRules(sizeTokens, styleTokens)],
    shortcuts: createShortcuts(options.shortcutsPrefix),
    preflights: [
      ...(switchedTheme.preflights || []),
      {
        getCSS: () => `@keyframes wave-spread{0%{box-shadow:0 0 0 0 currentColor;opacity:.35}100%{box-shadow:0 0 0 6px currentColor;opacity:0}}`,
      },
    ],
    extractors: [
      extractorIcons(),
    ],
  } as Preset<Theme>
}

export const presetUpthrust = definePreset(createPreset)

export default presetUpthrust
export { extractorIcons } from './extractors'
export type { SizeTokens, StyleTokens }
