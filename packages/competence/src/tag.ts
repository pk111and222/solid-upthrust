import { createSignal, untrack } from 'solid-js'
import { parseColor } from './colorPicker/color'
import { isPresetColor, isPresetStatusColor } from './presetColors'

export type TagVariant = 'filled' | 'solid' | 'outlined'

export interface TagColorInput {
  color?: string
  variant?: TagVariant
  /** @deprecated antd 6 起用 variant="filled" 代替 bordered={false}。 */
  bordered?: boolean
}

export interface TagColorState {
  variant: TagVariant
  /** 去掉 -inverse 后的颜色；solid 且未设颜色时为 'default'。 */
  color: string | undefined
  isPreset: boolean
  isStatus: boolean
  /** 自定义颜色的内联样式；预设/状态色为空对象。 */
  customStyle: Record<string, string>
}

const hslHex = (r: number, g: number, b: number, a: number, lightness: number) => {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min
  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  let h = 0
  if (delta !== 0) h = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4
  h = (h * 60 + 360) % 360
  const c = (1 - Math.abs(2 * lightness - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = lightness - c / 2
  const [r1, g1, b1] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]
  const channels = [r1, g1, b1].map(v => Math.round((v + m) * 255))
  if (a < 1) channels.push(Math.round(a * 255))
  return '#' + channels.map(v => v.toString(16).padStart(2, '0')).join('')
}

/**
 * antd useColor 的浅色背景：保持色相/饱和度，把 HSL 亮度设为 0.95。
 * 无法解析的颜色（如 CSS 命名色）退回 color-mix 近似。
 */
export const tagLightBackground = (color: string) => {
  const parsed = parseColor(color)
  if (!parsed) return `color-mix(in srgb, ${color} 10%, #fff)`
  const { r, g, b, a } = parsed.toRgb()
  return hslHex(r, g, b, a, 0.95)
}

/** 纯函数：antd 6 useColor 的变体/颜色归一，UI 层只按结果选类或内联样式。 */
export const resolveTagColor = (input: TagColorInput): TagColorState => {
  const { color } = input
  const isInverse = typeof color === 'string' && color.endsWith('-inverse')
  // variant > -inverse（旧写法，等价 solid）> 默认 filled；bordered={false} 与默认 filled 相同，
  // bordered={true} 在 antd 6 中也不再产生描边（描边请用 variant="outlined"）。
  const variant: TagVariant = input.variant ?? (isInverse ? 'solid' : 'filled')
  let next = isInverse ? color!.slice(0, -'-inverse'.length) : color
  if (next === undefined && variant === 'solid') next = 'default'
  const isPreset = isPresetColor(next), isStatus = isPresetStatusColor(next)
  const customStyle: Record<string, string> = {}
  if (!isPreset && !isStatus && next) {
    if (variant === 'solid') customStyle['background-color'] = next
    else {
      customStyle['background-color'] = tagLightBackground(next)
      customStyle.color = next
      if (variant === 'outlined') customStyle['border-color'] = next
    }
  }
  return { variant, color: next, isPreset, isStatus, customStyle }
}

export interface TagClosableConfig {
  closeIcon?: unknown
  'aria-label'?: string
}

export type TagClosableState = false | { closeIcon: unknown; ariaLabel: string | undefined }

/**
 * antd useClosable 的判定：closable=false 或（未设 closable 且 closeIcon 为 false/null）隐藏；
 * 两者都未设置时不可关闭；closeIcon 为布尔值时使用默认图标（返回 undefined）。
 */
export const resolveTagClosable = (closable: boolean | TagClosableConfig | undefined, closeIcon: unknown): TagClosableState => {
  if (!closable && (closable === false || closeIcon === false || closeIcon === null)) return false
  if (closable === undefined && closeIcon === undefined) return false
  const fromObject = closable && typeof closable === 'object' ? closable : undefined
  const ownIcon = typeof closeIcon === 'boolean' || closeIcon === null ? undefined : closeIcon
  return {
    closeIcon: fromObject && fromObject.closeIcon !== undefined ? fromObject.closeIcon : ownIcon,
    ariaLabel: fromObject?.['aria-label'],
  }
}

export interface TagConfig {
  disabled?: boolean
  /** 有 href 时关闭会阻止链接跳转。 */
  href?: string
  onClose?: (event: MouseEvent) => void
}

/** 关闭可在 onClose 中 preventDefault 取消，用于二次确认。 */
export const createTag = (config: TagConfig = {}) => {
  const [visible, setVisible] = createSignal(true, { ownedWrite: true })
  const close = (event: MouseEvent) => {
    // 与 antd 一致：禁用时直接返回，不拦截冒泡
    if (config.disabled || !untrack(visible)) return
    event.stopPropagation()
    config.onClose?.(event)
    if (event.defaultPrevented) return
    if (config.href) event.preventDefault()
    setVisible(false)
  }
  return { visible, close }
}

export interface CheckableTagConfig {
  checked?: boolean
  /** 本库扩展：antd 为完全受控，本库在未传 checked 时使用内部状态。 */
  defaultChecked?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

export const createCheckableTag = (config: CheckableTagConfig = {}) => {
  const [internal, setInternal] = createSignal(untrack(() => config.defaultChecked) ?? false, { ownedWrite: true })
  // 同步镜像：同一批次内连续切换不读到旧值
  let pending = untrack(internal)
  const checked = () => config.checked ?? internal()
  const toggle = () => {
    if (config.disabled) return
    const next = !(config.checked ?? pending)
    if (config.checked === undefined) { pending = next; setInternal(next) }
    config.onChange?.(next)
  }
  return { checked, toggle }
}

export type CheckableTagValue = string | number

export interface CheckableTagOption<V extends CheckableTagValue = CheckableTagValue> {
  value: V
  label: unknown
  class?: string
  style?: unknown
}

export interface CheckableTagGroupConfig<V extends CheckableTagValue = CheckableTagValue> {
  multiple?: boolean
  value?: V | V[] | null
  defaultValue?: V | V[] | null
  disabled?: boolean
  onChange?: (value: any) => void
}

/** 原始值选项归一为 { value, label }；非数组视为空。 */
export const normalizeCheckableTagOptions = <V extends CheckableTagValue>(options: unknown): CheckableTagOption<V>[] =>
  Array.isArray(options)
    ? options.map(option => option !== null && typeof option === 'object' ? option as CheckableTagOption<V> : { value: option as V, label: option })
    : []

const asList = <V>(value: V | V[] | null | undefined): V[] => Array.isArray(value) ? value : []

/** antd CheckableTagGroup：单选再次点击取消为 null；多选追加/移除。value !== undefined 即受控（null 也受控）。 */
export const createCheckableTagGroup = <V extends CheckableTagValue>(config: CheckableTagGroupConfig<V>) => {
  const initial = (untrack(() => config.defaultValue) ?? (untrack(() => config.multiple) ? [] : null)) as V | V[] | null
  // 泛型 V 会让 createSignal 误选计算函数重载，内部按具体联合类型存储
  type Stored = CheckableTagValue | CheckableTagValue[] | null
  const [stored, setInternal] = createSignal<Stored>(initial, { ownedWrite: true })
  const internal = () => stored() as V | V[] | null
  let pending: V | V[] | null = initial
  const value = () => config.value !== undefined ? config.value : internal()
  const isChecked = (option: V) => config.multiple ? asList(value()).includes(option) : value() === option
  const change = (option: V, checked: boolean) => {
    if (config.disabled) return
    const base = config.value !== undefined ? config.value : pending
    let next: V | V[] | null
    if (config.multiple) {
      const list = asList(base)
      next = checked ? (list.includes(option) ? list : [...list, option]) : list.filter(item => item !== option)
    } else next = checked ? option : null
    if (config.value === undefined) { pending = next; setInternal(() => next as Stored) }
    config.onChange?.(next)
  }
  return { value, isChecked, change }
}
