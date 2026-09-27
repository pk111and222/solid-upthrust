/**
 * Responsive breakpoint constants (px), shared by Sider breakpoint collapsing
 * and Masonry responsive columns. Values follow standard breakpoint spec.
 */
export const BREAKPOINTS = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

export const BREAKPOINT_KEYS = Object.keys(BREAKPOINTS) as Breakpoint[]

/**
 * Screen keys used by Grid (Row responsive props, Col xs..xxxl, useBreakpoint),
 * ordered narrow → wide. Unlike BREAKPOINTS (Sider/Masonry thresholds, where
 * xs=480 is a min-width), `xs` here is the "below sm" screen — matching the
 * standard grid semantics — and `xxxl` (≥1920) extends the scale.
 */
export const SCREEN_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'] as const

export type Screen = (typeof SCREEN_KEYS)[number]

/** Min-width (px) of every screen above xs. */
export const SCREEN_MIN_WIDTHS = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
  xxxl: 1920,
} as const satisfies Record<Exclude<Screen, 'xs'>, number>

/** Media query per screen; xs uses a fractional max-width so no width falls between xs and sm. */
export const SCREEN_QUERIES: Record<Screen, string> = {
  xs: '(max-width: 575.98px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1600px)',
  xxxl: '(min-width: 1920px)',
}
