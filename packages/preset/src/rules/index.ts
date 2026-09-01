import type { Rule } from '@unocss/core'
import type { SizeTokens } from '../theme/size'
import type { StyleTokens } from '../theme/style'

/** The individual-transform CSS properties wind4's whitelist forgot. */
const INDIVIDUAL_TRANSFORM_PROPS = ['translate', 'scale', 'rotate']
/**
 * Extended whitelist for arbitrary-value transition lists: wind4's own
 * cssProps (color/opacity/margin/...) plus translate/scale/rotate. Only
 * lists fully covered here are handled by our interceptor rule; anything
 * else defers to wind4's native behaviour.
 */
const TRANSITION_PROPS_WHITELIST = [
  ...INDIVIDUAL_TRANSFORM_PROPS,
  'color', 'background-color', 'border-color', 'text-decoration-color', 'fill', 'stroke',
  'opacity', 'visibility', 'box-shadow', 'filter', 'backdrop-filter', 'transform',
  'margin', 'padding', 'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
  'font-size', 'font-weight', 'line-height', 'letter-spacing', 'word-spacing', 'text-indent',
  'border', 'border-width', 'border-radius', 'border-spacing', 'outline-color', 'outline-width', 'outline-offset',
  'gap', 'top', 'right', 'bottom', 'left', 'z-index', 'flex', 'flex-grow', 'flex-shrink',
  'grid', 'grid-template-columns', 'grid-template-rows', 'object-position', 'vertical-align',
  'clip-path', 'mask', 'mask-border', 'mask-size', 'caret-color', 'text-shadow', 'zoom',
]

/**
 * Rules are built from the resolved size/style tokens so that
 * `presetUpthrust({ switchedTheme: { sizeTokens, styleTokens } })`
 * overrides propagate into every utility class below.
 */
export function createRules(sizeTokens: SizeTokens, styleTokens: StyleTokens): Rule[] {
  return [
    // overflow-anchor:none — wind4 has NO utility for it, and the virtual
    // List NEEDS it: Chrome's native scroll anchoring fights the spacer
    // padding adjustments and produces mid-scroll jumps.
    [/^overflow-anchor-none$/, () => ({ 'overflow-anchor': 'none' })],

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
    // Overlay/layer motion: opacity + the modern individual transforms ONLY.
    // wind4's arbitrary-value transition-[...] validates each property against
    // a whitelist that lacks translate/scale, so a list naming them generates
    // NO rule at all — the class silently falls back to transition-property:
    // all, which also transitions top/left and makes positioned layers glide
    // in from their seed coordinates. This preset-owned variant has no
    // whitelist, so it is the correct way to name translate/scale.
    [/^transition-overlay$/, () => ({
      'transition-property': 'opacity, transform, translate, scale',
      'transition-timing-function': styleTokens.motionEaseInOut,
    })],
    // Stack variant for notification/message rows: the leave animation also
    // collapses the row's box (margin / max-height / padding), so the stack
    // glides together instead of teleporting. Same whitelist rationale as
    // transition-overlay — arbitrary values cannot name these reliably.
    [/^transition-overlay-stack$/, () => ({
      'transition-property': 'opacity, transform, translate, scale, margin, max-height, padding',
      'transition-timing-function': styleTokens.motionEaseInOut,
    })],

    // ---- arbitrary-value transition whitelist PATCH -------------------------
    // wind4's `transition-[...]` validates every listed property against a
    // hardcoded cssProps list that lacks the individual-transform properties
    // (translate / scale / rotate). One non-whitelisted item and the rule
    // generates NOTHING — the class silently falls back to
    // `transition-property: all`, which also transitions top/left and makes
    // positioned layers glide in from their seed coordinates.
    //
    // This preset rule INTERCEPTS the arbitrary-value form first (preset rules
    // registered after wind4 match earlier) and validates against an EXTENDED
    // whitelist, so consumers writing `transition-[opacity,transform,translate,scale]`
    // in their own code get a correct rule instead of the silent all-fallback.
    // Lists without individual transforms still fall through to wind4's own
    // handling (this rule returns undefined) — behaviour for them is unchanged.
    [/^transition-\[(.+?)\]$/, ([, list]) => {
      const props = list.split(',').map(p => p.trim()).filter(Boolean)
      if (props.length === 0) return
      // Only take over when the list names an individual-transform property
      // (exactly the case wind4 rejects); otherwise defer to wind4.
      if (!props.some(p => INDIVIDUAL_TRANSFORM_PROPS.includes(p))) return
      if (!props.every(p => TRANSITION_PROPS_WHITELIST.includes(p))) return
      return {
        'transition-property': props.join(', '),
        'transition-timing-function': 'var(--un-ease, cubic-bezier(0.645, 0.045, 0.355, 1))',
      }
    }],

    // Wave animation for Button click effect
    [/^animate-wave$/, () => ({
      animation: 'wave-spread 0.4s cubic-bezier(0.08, 0.82, 0.17, 1)',
    })],

    // Spin spinner (antd easing: ease-in-out half-turns so the loop has weight)
    [/^animate-spin-upthrust$/, () => ({
      animation: `ut-spin-rotate ${styleTokens.motionDurationSlow} cubic-bezier(0.42, 0, 0.58, 1) infinite`,
    })],

    // Skeleton wave sweep — requires a gradient background (linear 90deg
    // from base to highlight back to base) sized 200%+ so the 100%→0
    // background-position animation actually travels.
    [/^animate-skeleton-wave$/, () => ({
      'background-size': '200% 100%',
      animation: `ut-skeleton-wave 1.6s ease-in-out infinite`,
    })],

    // Badge status "processing" pulse (antd antStatusProcessing): the ring
    // scales up 0.8→2.4 while fading 0.5→0. Applied to the dot's ::after.
    [/^animate-badge-processing$/, () => ({
      animation: `ut-badge-processing 1.2s ease-in-out infinite`,
    })],
  ]
}
