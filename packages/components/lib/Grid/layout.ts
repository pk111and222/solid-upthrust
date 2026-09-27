import type { JSX } from '@solidjs/web'
import { COL_LAYER_CLASS, colVar, type ColField, type ColLayer } from './styles'

/** 栅格数值：数字或数字字符串（与 antd ColSpanType 一致），无法解析的值被忽略。 */
export type ColSpanType = number | string

/** 某个断点下的列配置对象。 */
export interface ColSize {
  span?: ColSpanType
  offset?: ColSpanType
  push?: ColSpanType
  pull?: ColSpanType
  order?: ColSpanType
  flex?: number | string
}

/** 断点层：xs 没有媒体查询，与基础 props 合并为 base 层。 */
export const BREAKPOINT_LAYERS = ['sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'] as const
export type ColBreakpoint = 'xs' | (typeof BREAKPOINT_LAYERS)[number]

const GRID_COLUMNS = 24

const toNumber = (value: ColSpanType | undefined): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : undefined
}

const percent = (n: number) => `${(n / GRID_COLUMNS) * 100}%`

/**
 * antd parseFlex：数字 n → `n n auto`；带单位的长度 → `0 0 长度`；
 * auto → `1 1 auto`；其余（none、完整简写、纯数字字符串）原样透传。
 */
export const parseFlex = (flex: number | string): string => {
  if (typeof flex === 'number') return `${flex} ${flex} auto`
  if (/^\d+(\.\d+)?(px|em|rem|%)$/.test(flex)) return `0 0 ${flex}`
  if (flex === 'auto') return '1 1 auto'
  return flex
}

/** 一层解析后的布局值：span 决定宽度/显隐，其余字段已是 CSS 值。 */
type LayerSpec = { span?: number } & Partial<Record<Exclude<ColField, 'max-width'>, string>>

/**
 * 基础层的 0 值被跳过（antd 基础 props 的 0 不产生类）；断点层的 0 显式生效，
 * 以便覆盖更窄层：offset 0 → 0，push/pull 0 → auto，order 0 → 0。
 */
const readSize = (size: ColSize, explicitZero: boolean, into: LayerSpec = {}): LayerSpec => {
  const span = toNumber(size.span)
  if (span !== undefined && span >= 0) into.span = span

  const offset = toNumber(size.offset)
  if (offset !== undefined && (offset > 0 || (explicitZero && offset === 0))) into.offset = offset === 0 ? '0' : percent(offset)

  for (const field of ['push', 'pull'] as const) {
    const value = toNumber(size[field])
    if (value !== undefined && (value > 0 || (explicitZero && value === 0))) into[field] = value === 0 ? 'auto' : percent(value)
  }

  const order = toNumber(size.order)
  if (order !== undefined && (order !== 0 || explicitZero)) into.order = String(order)

  if (size.flex !== undefined && size.flex !== '') into.flex = parseFlex(size.flex)
  return into
}

const asSize = (value: ColSpanType | ColSize | undefined): ColSize | undefined =>
  value === undefined ? undefined : typeof value === 'object' ? value : { span: value }

export type ColLayoutInput = ColSize & Partial<Record<ColBreakpoint, ColSpanType | ColSize>>

export type ColLayout = {
  /** 静态类名（均来自 styles.ts 的字面量表）。 */
  classes: string[]
  /** 与类名配对的内联 CSS 变量。 */
  vars: JSX.CSSProperties
  /** base 层是否写了 max-width（此时去掉默认 max-w-full）。 */
  hasBaseMaxWidth: boolean
}

/**
 * 把 span/offset/push/pull/order 与 xs…xxxl 拆成 base + 6 个断点层。
 * 每个字段只有在本元素写了对应变量时才挂消费它的类——自定义属性会继承，
 * 若依赖 var() 回退，嵌套列会读到父列的变量。
 */
export const colLayout = (input: ColLayoutInput): ColLayout => {
  // flex 基础 prop 走内联 style（antd 行为），不进入 base 层变量。
  const layers: [ColLayer, LayerSpec][] = []
  const base = readSize({ ...input, flex: undefined }, false)
  const xs = asSize(input.xs)
  if (xs) readSize(xs, true, base)
  layers.push(['base', base])
  for (const bp of BREAKPOINT_LAYERS) {
    const size = asSize(input[bp])
    if (size) layers.push([bp, readSize(size, true)])
  }

  const classes: string[] = []
  const vars: Record<string, string> = {}
  let hidden = false
  let hasBaseMaxWidth = false

  const set = (layer: ColLayer, field: ColField, value: string) => {
    vars[colVar(layer, field)] = value
    classes.push(COL_LAYER_CLASS[layer][field])
  }

  for (const [layer, spec] of layers) {
    const { span } = spec
    if (span === 0) {
      classes.push(COL_LAYER_CLASS[layer].hidden)
      hidden = true
    } else if (span !== undefined) {
      if (hidden) {
        classes.push(COL_LAYER_CLASS[layer].block)
        hidden = false
      }
      set(layer, 'flex', `0 0 ${percent(span)}`)
      set(layer, 'max-width', percent(span))
      if (layer === 'base') hasBaseMaxWidth = true
    }
    if (spec.flex !== undefined) {
      if (span === undefined || span === 0) set(layer, 'flex', spec.flex)
      else vars[colVar(layer, 'flex')] = spec.flex
    }
    for (const field of ['offset', 'push', 'pull', 'order'] as const) {
      const value = spec[field]
      if (value !== undefined) set(layer, field, value)
    }
  }

  return { classes, vars: vars as JSX.CSSProperties, hasBaseMaxWidth }
}

/** 间距单值：数字或 CSS 长度字符串（纯数字字符串按数字处理）。 */
export type GutterValue = number | string

const normalizeGutter = (value: GutterValue | undefined): GutterValue | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return undefined
    return /^-?\d+(\.\d+)?$/.test(trimmed) ? normalizeGutter(Number(trimmed)) : trimmed
  }
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined
}

/** 水平间距取半（sign=-1 用于 Row 负外边距，sign=1 用于 Col 内边距）。 */
export const halfGutter = (value: GutterValue | undefined, sign: 1 | -1): string | undefined => {
  const g = normalizeGutter(value)
  if (g === undefined) return undefined
  return typeof g === 'number' ? `${(sign * g) / 2}px` : `calc(${g} / ${sign * 2})`
}

/** 垂直间距写 row-gap。 */
export const rowGap = (value: GutterValue | undefined): string | undefined => {
  const g = normalizeGutter(value)
  return typeof g === 'number' ? `${g}px` : g
}
