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

  const [switchedTheme, palettes, gap, sizeTokens, styleTokens] = createTheme(options.switchedTheme, options.defaultTheme, options.theme?.colors)

  // preset-wind4's default radius/shadow scales — spread so our overrides only
  // replace the spec entries and keep wind4's remaining keys (rounded-full,
  // shadow-xl, ...) intact.
  const wind4Defaults = presetWind4().theme ?? {}

  const defaultTheme = options.defaultTheme ?? 'light'
  const configuredColors = options.switchedTheme?.theme?.[defaultTheme]?.colors
  const themeColor = configuredColors ?? (defaultTheme === 'dark' ? palettes.dark : palettes.light)

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
      ...options.theme,
      colors: {
        // Native keyword colors wind4's rules reference via CSS variables
        // (bg-black/85 compiles to color-mix(var(--colors-black) ...)). Our
        // MD3 palette REPLACES wind4's color theme, so re-register the two
        // keyword colors or every `bg-black/…` silently resolves to nothing.
        black: '#000',
        white: '#fff',
        ...themeColor,
        ...options.theme?.colors,
      },
      spacing: { ...spacing, ...options.theme?.spacing },
      text: {
        'heading-1': { fontSize: sizeTokens.fontSizeHeading1, lineHeight: '1.2105' },
        'heading-2': { fontSize: sizeTokens.fontSizeHeading2, lineHeight: '1.2667' },
        'heading-3': { fontSize: sizeTokens.fontSizeHeading3, lineHeight: '1.3333' },
        'heading-4': { fontSize: sizeTokens.fontSizeHeading4, lineHeight: '1.4' },
        'heading-5': { fontSize: sizeTokens.fontSizeHeading5, lineHeight: '1.5' },
        'body': { fontSize: sizeTokens.fontSize, lineHeight: sizeTokens.lineHeight },
        'body-sm': { fontSize: sizeTokens.fontSizeSM, lineHeight: sizeTokens.lineHeight },
        'body-lg': { fontSize: sizeTokens.fontSizeLG, lineHeight: '1.5' },
        ...options.theme?.text,
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
        ...options.theme?.radius,
      },
      shadow: {
        ...wind4Defaults.shadow,
        DEFAULT: styleTokens.boxShadow,
        'secondary': styleTokens.boxShadowSecondary,
        'tertiary': styleTokens.boxShadowTertiary,
        ...options.theme?.shadow,
      },
    },
    rules: [...(switchedTheme.rules || []), ...createRules(sizeTokens, styleTokens)],
    shortcuts: createShortcuts(options.shortcutsPrefix),
    preflights: [
      ...(switchedTheme.preflights || []),
      {
        // Shared keyframes. Spin: antd's spinner easing — a slightly
        // off-balance rotate so the loop doesn't read as metronomic.
        // Skeleton: antd's wave gradient sweep.
        // Badge processing: antd's status pulse — the dot itself stays put
        // while an expanding ring fades out (consumed via
        // `after:animate-badge-processing` on the dot's ::after).
        getCSS: () => [
          `@keyframes wave-spread{0%{box-shadow:0 0 0 0 currentColor;opacity:.35}100%{box-shadow:0 0 0 6px currentColor;opacity:0}}`,
          `@keyframes ut-spin-rotate{0%{transform:rotate(0deg)}50%{transform:rotate(180deg)}100%{transform:rotate(360deg)}}`,
          `@keyframes ut-skeleton-wave{0%{background-position:100% 50%}100%{background-position:0 50%}}`,
          `@keyframes ut-badge-processing{0%{transform:scale(0.8);opacity:0.5}100%{transform:scale(2.4);opacity:0}}`,
          `@keyframes ut-zoom-in{0%{transform:scale(0.2);opacity:0}100%{transform:scale(1);opacity:1}}`,
          `@keyframes ut-form-explain-item{0%{transform:translateY(-5px);opacity:0;max-height:0}100%{transform:translateY(0);opacity:1;max-height:64px}}`,
        ].join(''),
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
