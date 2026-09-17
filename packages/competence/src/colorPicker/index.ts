import { createMemo, createSignal, untrack } from 'solid-js'
import { Color, parseColor, clampColor, type ColorFormat, type ColorHsb, type ColorInput } from './color'
export * from './color'
export interface ColorPickerConfig {
  value?: ColorInput | null
  defaultValue?: ColorInput | null
  format?: ColorFormat
  defaultFormat?: ColorFormat
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  disabledAlpha?: boolean
  allowClear?: boolean
  onChange?: (color: Color | null, css: string) => void
  onChangeComplete?: (color: Color | null) => void
  onFormatChange?: (format: ColorFormat) => void
  onOpenChange?: (open: boolean) => void
  onClear?: () => void
}
export function createColorPicker(config: ColorPickerConfig = {}) {
  const normalize = (input: ColorInput | null | undefined) => {
    const color = input === null || input === undefined || input === '' ? null : parseColor(input) ?? null
    return color && config.disabledAlpha ? new Color({ ...color.toHsb(), a: 1 }) : color
  }
  let internal = untrack(() => normalize(config.defaultValue))
  let internalFormat = untrack(() => config.defaultFormat ?? 'hex')
  let internalOpen = untrack(() => config.defaultOpen ?? false)
  const [revision, setRevision] = createSignal(0, { ownedWrite: true })
  let pending: Color | null | undefined
  const read = () => config.value === undefined ? normalize(internal) : normalize(config.value)
  const color = createMemo(() => { revision(); return read() })
  const hsb = () => color()?.toHsb() ?? { h: 215, s: 91, b: 100, a: 1 }
  const format = createMemo(() => { revision(); return config.format ?? internalFormat })
  const open = createMemo(() => { revision(); return !config.disabled && (config.open ?? internalOpen) })
  const setOpen = (next: boolean) => untrack(() => {
    if (config.disabled || next === (config.open ?? internalOpen)) return
    if (config.open === undefined) { internalOpen = next; setRevision(n => n + 1) }
    config.onOpenChange?.(next)
  })
  const complete = () => untrack(() => {
    if (pending === undefined) return
    const next = pending; pending = undefined
    if (!config.disabled) config.onChangeComplete?.(next)
  })
  const setColor = (input: ColorInput, finish = true) => untrack(() => {
    if (config.disabled) return false
    const parsed = parseColor(input)
    if (!parsed) return false
    const next = normalize(parsed)!
    pending = next
    if (config.value === undefined) { internal = next; setRevision(n => n + 1) }
    config.onChange?.(next, next.toCssString())
    if (finish) complete()
    return true
  })
  const setHsb = (patch: Partial<ColorHsb>, finish = true) => untrack(() => setColor({ ...(read()?.toHsb() ?? hsb()), ...patch }, finish))
  const setSaturationBrightness = (x: number, y: number, finish = false) => setHsb({ s: clampColor(x) * 100, b: (1 - clampColor(y)) * 100 }, finish)
  const setFormat = (next: ColorFormat) => untrack(() => {
    if (config.disabled || !['hex', 'rgb', 'hsb'].includes(next) || next === (config.format ?? internalFormat)) return
    if (config.format === undefined) { internalFormat = next; setRevision(n => n + 1) }
    config.onFormatChange?.(next)
  })
  const clear = () => untrack(() => {
    if (config.disabled || !config.allowClear) return
    if (config.value === undefined) { internal = null; setRevision(n => n + 1) }
    pending = null; config.onChange?.(null, ''); config.onClear?.(); complete()
  })
  return { color, hsb, format, open, setOpen, setColor, setHsb, setSaturationBrightness, setFormat, clear, complete,
    text: () => color()?.toString(format()) ?? '', css: () => color()?.toCssString() ?? 'transparent' }
}
export type ColorPickerIns = ReturnType<typeof createColorPicker>
