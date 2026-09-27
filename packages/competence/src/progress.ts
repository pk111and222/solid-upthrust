import { parseColor } from './colorPicker/color'

/**
 * Progress 的纯计算层：对照 antd 6.6.5 `progress/{progress,utils,Line,Steps,Circle}`
 * 与 `@rc-component/progress` 的 Circle / util 逐项移植。只输出数值与样式对象，UI 层负责渲染。
 */

export type ProgressType = 'line' | 'circle' | 'dashboard'
export type ProgressStatus = 'normal' | 'exception' | 'active' | 'success'
export type ProgressLinecap = 'round' | 'butt' | 'square'
export type ProgressGapPlacement = 'top' | 'bottom' | 'start' | 'end'
/** @deprecated 请使用 ProgressGapPlacement */
export type ProgressGapPosition = 'top' | 'bottom' | 'left' | 'right'
/** `{ from, to, direction }` 或 `{ '0%': c1, '100%': c2 }` 形式的渐变。 */
export type ProgressGradient = { direction?: string } & Record<string, string>
export type ProgressStrokeColor = string | string[] | ProgressGradient
export type ProgressSize =
  | 'small' | 'medium' | 'middle' | 'default'
  | number
  | [number | undefined, number | undefined]
  | { width?: number; height?: number }
export interface ProgressSuccess { percent?: number; strokeColor?: string }
export type ProgressSteps = number | { count: number; gap?: number }

export const PROGRESS_STATUSES: readonly ProgressStatus[] = ['normal', 'exception', 'active', 'success']
/** antd presetPrimaryColors.green / blue。 */
export const PROGRESS_SUCCESS_COLOR = '#52c41a'
export const PROGRESS_DEFAULT_GRADIENT_COLOR = '#1677ff'

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** 0–100 钳制；非数与负数为 0。 */
export const validProgress = (progress?: number | null): number => {
  if (!progress || progress < 0) return 0
  if (progress > 100) return 100
  return progress
}

/** 只有 success 对象里显式写了 percent 才算有成功段。 */
export const getSuccessPercent = (success?: ProgressSuccess | null): number | undefined =>
  success && 'percent' in success ? success.percent : undefined

/** [成功段, 剩余进度段]，两段相加不超过 100。 */
export const getPercentage = (percent?: number, success?: ProgressSuccess | null): [number, number] => {
  const realSuccess = validProgress(getSuccessPercent(success))
  return [realSuccess, validProgress(validProgress(percent) - realSuccess)]
}

export const getStrokeColor = <C>(success: ProgressSuccess | null | undefined, strokeColor: C | undefined): [string, C | null] =>
  [success?.strokeColor || PROGRESS_SUCCESS_COLOR, strokeColor || null]

/** aria-valuenow：有成功段时取成功段，否则取 percent（parseInt 截断）。 */
export const progressPercentNumber = (percent?: number, success?: ProgressSuccess | null): number => {
  const successPercent = getSuccessPercent(success)
  return Number.parseInt(String(successPercent !== undefined ? successPercent ?? 0 : percent ?? 0), 10)
}

/** 未指定合法状态且 ≥ 100 时自动为 success。 */
export const progressStatusOf = (status: string | undefined, percentNumber: number): ProgressStatus => {
  if (!PROGRESS_STATUSES.includes(status as ProgressStatus) && percentNumber >= 100) return 'success'
  return (status || 'normal') as ProgressStatus
}

/** size 的 'middle' / 'default' 是 'medium' 的别名。 */
export const normalizeProgressSize = (size: ProgressSize | undefined): Exclude<ProgressSize, 'middle' | 'default'> | undefined =>
  size === 'middle' || size === 'default' ? 'medium' : size

/** antd getSize：line 返回 [宽(-1=撑满), 高]；step 返回 [总宽, 高]；circle 返回 [直径, 直径]。 */
export const getProgressSize = (
  size: ProgressSize | undefined,
  type: 'line' | 'step' | 'circle' | 'dashboard',
  extra: { steps?: number; strokeWidth?: number } = {},
): [number, number] => {
  let width = -1
  let height = -1
  if (type === 'step') {
    const steps = extra.steps ?? 1
    if (typeof size === 'string' || size === undefined) {
      width = size === 'small' ? 2 : 14
      height = extra.strokeWidth ?? 8
    } else if (typeof size === 'number') {
      width = height = size
    } else {
      const [w, h] = Array.isArray(size) ? size : [size.width, size.height]
      width = w ?? 14
      height = h ?? 8
    }
    width *= steps
  } else if (type === 'line') {
    if (typeof size === 'string' || size === undefined) {
      height = extra.strokeWidth || (size === 'small' ? 6 : 8)
    } else if (typeof size === 'number') {
      width = height = size
    } else {
      const [w, h] = Array.isArray(size) ? size : [size.width, size.height]
      width = w ?? -1
      height = h ?? 8
    }
  } else if (typeof size === 'string' || size === undefined) {
    width = height = size === 'small' ? 60 : 120
  } else if (typeof size === 'number') {
    width = height = size
  } else if (Array.isArray(size)) {
    width = height = size[0] ?? size[1] ?? 120
  }
  return [width, height]
}

/** `{ '0%': a, '50%': b }` → 'a 0%, b 50%'（按数值排序，非数字键忽略）。 */
export const sortGradient = (gradients: Record<string, string>): string =>
  Object.keys(gradients)
    .map(key => ({ key: Number.parseFloat(key.replace(/%/g, '')), value: gradients[key] }))
    .filter(item => !Number.isNaN(item.key))
    .sort((a, b) => a.key - b.key)
    .map(({ key, value }) => `${value} ${key}%`)
    .join(', ')

/** 线形进度条渐变背景。 */
export const handleGradient = (strokeColor: ProgressGradient): string => {
  const { from = PROGRESS_DEFAULT_GRADIENT_COLOR, to = PROGRESS_DEFAULT_GRADIENT_COLOR, direction = 'to right', ...rest } = strokeColor
  if (Object.keys(rest).length !== 0) return `linear-gradient(${direction}, ${sortGradient(rest)})`
  return `linear-gradient(${direction}, ${from}, ${to})`
}

/** 进度色是否为亮色（内部数值改用 0.45 黑字）：FastColor.isLight 的亮度公式。 */
export const isBrightStrokeColor = (strokeColor: ProgressStrokeColor | undefined): boolean => {
  const first = Array.isArray(strokeColor) ? strokeColor[0] : strokeColor
  if (!first) return false
  const color = typeof first === 'string' ? first : Object.values(first)[0]
  const rgb = color ? parseColor(color)?.toRgb() : undefined
  if (!rgb) return false
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 >= 128
}

/** 步骤进度条：点亮的格数。 */
export const progressStepsCurrent = (steps: number, percent = 0, rounding: (n: number) => number = Math.round) =>
  rounding(steps * (percent / 100))

// ---- Circle -----------------------------------------------------------------

export const CIRCLE_VIEW_BOX = 100

export type CircleStyle = {
  stroke?: string
  'stroke-dasharray': string
  'stroke-dashoffset': number
  transform: string
  'transform-origin': string
  transition: string
  'fill-opacity': number
}

/** rc-progress getCircleStyle（原样移植，键名改为 CSS kebab-case）。 */
export const getCircleStyle = (
  perimeter: number,
  perimeterWithoutGap: number,
  offset: number,
  percent: number,
  rotateDeg: number,
  gapDegree: number,
  gapPosition: ProgressGapPosition | undefined,
  strokeColor: unknown,
  strokeLinecap: ProgressLinecap,
  strokeWidth: number,
  stepSpace = 0,
): CircleStyle => {
  const offsetDeg = (offset / 100) * 360 * ((360 - gapDegree) / 360)
  // antd 在 gapDegree > 0 且未给 gapPosition 时得到 NaN；这里按 bottom（0）处理。
  const positionDeg = gapDegree === 0 ? 0 : ({ bottom: 0, top: 180, left: 90, right: -90 }[gapPosition ?? 'bottom'] ?? 0)
  let strokeDashoffset = ((100 - percent) / 100) * perimeterWithoutGap
  // 圆头会多出半个线宽，补偿后才与百分比对齐；极小值时保留 0.01 防止消失。
  if (strokeLinecap === 'round' && percent !== 100) {
    strokeDashoffset += strokeWidth / 2
    if (strokeDashoffset >= perimeterWithoutGap) strokeDashoffset = perimeterWithoutGap - 0.01
  }
  const half = CIRCLE_VIEW_BOX / 2
  return {
    stroke: typeof strokeColor === 'string' ? strokeColor : undefined,
    'stroke-dasharray': `${perimeterWithoutGap}px ${perimeter}`,
    'stroke-dashoffset': strokeDashoffset + stepSpace,
    transform: `rotate(${rotateDeg + offsetDeg + positionDeg}deg)`,
    'transform-origin': `${half}px ${half}px`,
    transition: 'stroke-dashoffset .3s ease 0s, stroke-dasharray .3s ease 0s, stroke .3s, stroke-width .06s ease .3s, opacity .3s ease 0s',
    'fill-opacity': 0,
  }
}

/** 圆形默认线宽：至少 3px 视觉宽度，且不小于 6（viewBox 单位）。 */
export const circleStrokeWidth = (width: number, strokeWidth?: number) =>
  strokeWidth ?? Math.max((3 / width) * 100, 6)

/** gapDegree：显式值（含 0）优先，仪表盘默认 75，圆形 0。 */
export const circleGapDegree = (type: ProgressType, gapDegree?: number) =>
  gapDegree || gapDegree === 0 ? gapDegree : type === 'dashboard' ? 75 : 0

/** gapPlacement 优先于废弃的 gapPosition；仪表盘默认 bottom；start / end 映射为 left / right（未处理 RTL）。 */
export const circleGapPosition = (
  type: ProgressType,
  gapPlacement?: ProgressGapPlacement,
  gapPosition?: ProgressGapPosition,
): ProgressGapPosition | undefined => {
  const merged = (gapPlacement ?? gapPosition) || (type === 'dashboard' ? 'bottom' : undefined)
  if (merged === 'start') return 'left'
  if (merged === 'end') return 'right'
  return merged
}

export interface CircleGradientFill {
  /** 外层 div：线性渐变兜底。 */
  linear: string
  /** 内层 div：锥形渐变，沿圆弧着色。 */
  conic: string
}

export interface CirclePathSpec {
  /** 0 = 成功段，1 = 进度段；步骤模式为格序号。 */
  index: number
  ptg: number
  /** 字符串色走内联 stroke；null / undefined 时由状态类着色。 */
  color: string | null | undefined
  /** 渐变色：UI 用 mask + foreignObject 渲染。 */
  gradient?: CircleGradientFill
  /** 步骤模式：该格是否点亮（未点亮用导轨色）。 */
  active?: boolean
  opacity: number
  /** 步骤模式的格子不写 stroke-linecap 属性。 */
  linecap?: ProgressLinecap
  style: CircleStyle
}

export interface CircleLayout {
  radius: number
  strokeWidth: number
  linecap: ProgressLinecap
  /** 步骤模式没有导轨。 */
  rail?: CircleStyle
  /** 已按 rc-progress 的绘制顺序排列（进度段先画，成功段压在上面）。 */
  paths: CirclePathSpec[]
}

const ptgColors = (color: Record<string, string>, scale: number) =>
  Object.keys(color).map(key => `${color[key]} ${Math.floor(Number.parseFloat(key) * scale)}%`)

/** rc-progress PtgCircle 的渐变填充：linear 外层 + conic 内层。 */
export const circleGradientFill = (color: Record<string, string>, gapDegree: number): CircleGradientFill => {
  const fromDeg = gapDegree ? `${180 + gapDegree / 2}deg` : '0deg'
  return {
    linear: `linear-gradient(to ${gapDegree ? 'bottom' : 'top'}, ${ptgColors(color, 1).join(', ')})`,
    conic: `conic-gradient(from ${fromDeg}, ${ptgColors(color, (360 - gapDegree) / 360).join(', ')})`,
  }
}

/** rc-progress Circle 的几何：导轨、分段描边（成功 + 进度）或步骤格。 */
export const circleLayout = (options: {
  percent: number | number[]
  strokeColor: unknown
  strokeWidth: number
  gapDegree: number
  gapPosition?: ProgressGapPosition
  strokeLinecap?: ProgressLinecap
  railColor?: string
  steps?: ProgressSteps
}): CircleLayout => {
  const { strokeWidth, gapDegree, gapPosition, railColor } = options
  const half = CIRCLE_VIEW_BOX / 2
  const radius = half - strokeWidth / 2
  const perimeter = Math.PI * 2 * radius
  const rotateDeg = gapDegree > 0 ? 90 + gapDegree / 2 : -90
  const perimeterWithoutGap = perimeter * ((360 - gapDegree) / 360)
  const { count: stepCount, gap: stepGap = 2 } = typeof options.steps === 'object' ? options.steps : { count: options.steps, gap: 2 }
  const percentList = Array.isArray(options.percent) ? options.percent : [options.percent]
  const colorList: unknown[] = Array.isArray(options.strokeColor) ? options.strokeColor : [options.strokeColor ?? null]
  // 任一颜色为渐变对象时强制 butt（圆头会让渐变接缝错位）。
  const linecap: ProgressLinecap = colorList.some(isPlainObject) ? 'butt' : options.strokeLinecap ?? 'round'
  const style = (offset: number, ptg: number, color: unknown, cap: ProgressLinecap, space = 0) =>
    getCircleStyle(perimeter, perimeterWithoutGap, offset, ptg, rotateDeg, gapDegree, gapPosition, color, cap, strokeWidth, space)

  if (stepCount) {
    const current = Math.round(stepCount * ((percentList[0] ?? 0) / 100))
    const stepPtg = 100 / stepCount
    let stack = 0
    const paths = Array.from({ length: stepCount }, (_, index): CirclePathSpec => {
      const active = index <= current - 1
      const color = active ? colorList[0] : railColor
      const current_ = style(stack, stepPtg, color, 'butt', stepGap)
      stack += ((perimeterWithoutGap - current_['stroke-dashoffset'] + stepGap) * 100) / perimeterWithoutGap
      return { index, ptg: stepPtg, color: typeof color === 'string' ? color : null, active, opacity: 1, style: current_ }
    })
    return { radius, strokeWidth, linecap, paths }
  }

  let stack = 0
  const paths = percentList.map((ptg, index): CirclePathSpec => {
    const color = colorList[index] || colorList[colorList.length - 1]
    const current = style(stack, ptg, color, linecap)
    stack += ptg
    return {
      index,
      ptg,
      color: typeof color === 'string' ? color : null,
      gradient: isPlainObject(color) ? circleGradientFill(color as Record<string, string>, gapDegree) : undefined,
      opacity: ptg === 0 ? 0 : 1,
      linecap,
      style: current,
    }
  }).reverse()
  return { radius, strokeWidth, linecap, rail: style(0, 100, railColor, linecap), paths }
}
