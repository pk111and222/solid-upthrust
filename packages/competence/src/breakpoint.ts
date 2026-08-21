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
