export interface StyleTokens {
  borderRadiusXS: string
  borderRadiusSM: string
  borderRadius: string
  borderRadiusLG: string
  boxShadow: string
  boxShadowSecondary: string
  boxShadowTertiary: string
  motionDurationFast: string
  motionDurationMid: string
  motionDurationSlow: string
  motionEaseInOut: string
  motionEaseOut: string
  motionEaseIn: string
}

const DEFAULT_STYLE_TOKENS: StyleTokens = {
  borderRadiusXS: '2px',
  borderRadiusSM: '4px',
  borderRadius: '6px',
  borderRadiusLG: '8px',
  boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
  motionDurationFast: '0.1s',
  motionDurationMid: '0.2s',
  motionDurationSlow: '0.3s',
  motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  motionEaseOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  motionEaseIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
}

export function createStyleTokens(overrides?: Partial<StyleTokens>): StyleTokens {
  return { ...DEFAULT_STYLE_TOKENS, ...overrides }
}
