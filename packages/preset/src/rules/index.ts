import type { Rule } from '@unocss/core'
import type { SizeTokens } from '../theme/size'
import type { StyleTokens } from '../theme/style'

/**
 * Rules are built from the resolved size/style tokens so that
 * `presetUpthrust({ switchedTheme: { sizeTokens, styleTokens } })`
 * overrides propagate into every utility class below.
 */
export function createRules(sizeTokens: SizeTokens, styleTokens: StyleTokens): Rule[] {
  return [
    // Control heights with line-height
    [/^h-control$/, () => ({ height: sizeTokens.controlHeight, 'line-height': sizeTokens.controlHeight })],
    [/^h-control-sm$/, () => ({ height: sizeTokens.controlHeightSM, 'line-height': sizeTokens.controlHeightSM })],
    [/^h-control-lg$/, () => ({ height: sizeTokens.controlHeightLG, 'line-height': sizeTokens.controlHeightLG })],

    // Motion duration utilities
    [/^duration-fast$/, () => ({ 'transition-duration': styleTokens.motionDurationFast })],
    [/^duration-mid$/, () => ({ 'transition-duration': styleTokens.motionDurationMid })],
    [/^duration-slow$/, () => ({ 'transition-duration': styleTokens.motionDurationSlow })],

    // Motion easing utilities
    [/^ease-upthrust$/, () => ({ 'transition-timing-function': styleTokens.motionEaseInOut })],
    [/^ease-upthrust-out$/, () => ({ 'transition-timing-function': styleTokens.motionEaseOut })],
    [/^ease-upthrust-in$/, () => ({ 'transition-timing-function': styleTokens.motionEaseIn })],

    // Composite transition shorthands
    [/^transition-upthrust$/, () => ({
      'transition-property': 'all',
      'transition-duration': styleTokens.motionDurationMid,
      'transition-timing-function': styleTokens.motionEaseInOut,
    })],
    [/^transition-upthrust-fast$/, () => ({
      'transition-property': 'all',
      'transition-duration': styleTokens.motionDurationFast,
      'transition-timing-function': styleTokens.motionEaseInOut,
    })],
    [/^transition-upthrust-slow$/, () => ({
      'transition-property': 'all',
      'transition-duration': styleTokens.motionDurationSlow,
      'transition-timing-function': styleTokens.motionEaseInOut,
    })],

    // Wave animation for Button click effect
    [/^animate-wave$/, () => ({
      animation: 'wave-spread 0.4s cubic-bezier(0.08, 0.82, 0.17, 1)',
    })],
  ]
}
