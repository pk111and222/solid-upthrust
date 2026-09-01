import { createMemo } from "solid-js";

/**
 * Headless logic for Progress — percent normalization, stroke-path
 * geometry for the circle variant, and step-index derivation. Pure math +
 * derived state; the UI layer renders from these.
 */

export type ProgressConfig = {
  /** 0–100; clamped. Values outside range are coerced. */
  percent?: number
  /** Line success threshold — at/above shows success color. */
  success?: { percent?: number; strokeColor?: string }
  status?: 'success' | 'exception' | 'normal' | 'active'
  /** Circle radius, px. Default 120 (antd's SVG viewport math). */
  size?: number | [number, number]
  /** Circle stroke width, px. Default 6. */
  strokeWidth?: number
  steps?: number
  /** Trail/stroke colors as raw CSS color strings. */
  strokeColor?: string | { from?: string; to?: string; direction?: string }
  trailColor?: string
}

export type ProgressIns = {
  percent: () => number
  status: () => NonNullable<ProgressConfig['status']>
  successPercent: () => number | undefined
}

export const clampPercent = (v: number | undefined): number =>
  Math.min(100, Math.max(0, v ?? 0))

export const createProgress = (config: ProgressConfig = {}) => {
  const percent = createMemo(() => clampPercent(config.percent))

  const successPercent = createMemo(() =>
    config.success?.percent !== undefined ? clampPercent(config.success.percent) : undefined,
  )

  // Effective status: explicit wins; otherwise derive — 100 = success,
  // and 'exception' must be passed explicitly (antd parity).
  const status = createMemo((): NonNullable<ProgressConfig['status']> => {
    if (config.status) return config.status
    if (percent() >= 100) return 'success'
    return 'normal'
  })

  // ---- circle geometry ---------------------------------------------------
  // antd's Circle: viewBox 100×100-based path with a normalized radius so
  // strokeWidth scales. We expose the raw arc math for the UI to render.
  const circleGeometry = createMemo(() => {
    const size = typeof config.size === 'number' ? config.size : 100
    const strokeWidth = config.strokeWidth ?? 6
    // antd formula: radius = (100 - strokeWidth) / 2 in the 100-unit
    // viewBox space; the UI scales the SVG to the requested size.
    // strokeWidth > 10 overflows the viewBox (radius + stroke/2 > 50), so
    // clamp the stroke to keep the ring inside.
    const sw = Math.min(strokeWidth, 12)
    const radius = (100 - sw) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference * (1 - percent() / 100)
    return { size, strokeWidth: sw, radius, circumference, offset }
  })

  // ---- steps -------------------------------------------------------------
  const stepIndex = createMemo(() => {
    if (!config.steps) return undefined
    const p = percent()
    return Math.min(config.steps, Math.floor((p / 100) * config.steps + 1e-6))
  })

  const refs: ProgressIns = { percent, status, successPercent }

  return {
    percent,
    status,
    successPercent,
    circleGeometry,
    stepIndex,
    refs,
  }
}

/**
 * Circle arc path in the 100×100 viewBox space. Pure.
 * Full circle from 12 o'clock, clockwise, via two EXACT半圆 arcs (the
 * `cx - 0.01` hack renders as a degenerate arc in some engines and makes
 * the whole stroke vanish). Two half-circles join at 3 and 9 o'clock.
 */
export const circlePath = (radius: number): string => {
  const cx = 50, cy = 50
  const top = cy - radius
  const bottom = cy + radius
  const right = cx + radius
  return `M ${cx},${top} A ${radius},${radius} 0 0 1 ${right},${cy} A ${radius},${radius} 0 0 1 ${cx},${bottom} A ${radius},${radius} 0 0 1 ${cx - radius},${cy} A ${radius},${radius} 0 0 1 ${cx},${top} Z`
}

export const progressSplits: (keyof ProgressConfig)[] = [
  'percent', 'success', 'status', 'size', 'strokeWidth', 'steps', 'strokeColor', 'trailColor',
]
