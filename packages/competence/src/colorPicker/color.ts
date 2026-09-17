export interface ColorRgb { r: number; g: number; b: number; a?: number }
/** Saturation/brightness are percentages; alpha is in [0, 1]. */
export interface ColorHsb { h: number; s: number; b: number; a?: number }
export type ColorInput = string | Color | ColorRgb | ColorHsb
export type ColorFormat = 'hex' | 'rgb' | 'hsb'
export const clampColor = (value: number, max = 1) => Math.min(max, Math.max(0, value))
const hue = (h: number) => ((h % 360) + 360) % 360
const round = (n: number, digits = 2) => Number(n.toFixed(digits))
function rgbToHsb(r: number, g: number, b: number, a: number): Required<ColorHsb> {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min
  const h = delta === 0 ? 0 : max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4
  return { h: hue(h * 60), s: max ? delta / max * 100 : 0, b: max * 100, a }
}
const token = (raw: string, max: number) => {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)%?$/.test(raw)) throw new Error('Invalid color channel')
  if (!Number.isFinite(parseFloat(raw))) throw new Error('Invalid color channel')
  return clampColor(parseFloat(raw) * (raw.endsWith('%') ? max / 100 : 1), max)
}
const parse = (input: ColorInput): Required<ColorHsb> => {
  if (input instanceof Color) return input.toHsb()
  if (typeof input === 'object' && input !== null) {
    const a = input.a ?? 1
    const values = 'h' in input ? [input.h, input.s, input.b, a] : [input.r, input.g, input.b, a]
    if (!values.every(Number.isFinite)) throw new Error('Invalid color channels')
    return 'h' in input ? { h: hue(input.h), s: clampColor(input.s, 100), b: clampColor(input.b, 100), a: clampColor(a) }
      : rgbToHsb(clampColor(input.r, 255), clampColor(input.g, 255), clampColor(input.b, 255), clampColor(a))
  }
  if (typeof input !== 'string') throw new Error('Invalid color')
  const value = input.trim().toLowerCase()
  if (value === 'transparent') return { h: 0, s: 0, b: 0, a: 0 }
  const hex = /^#?([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/.exec(value)
  if (hex) {
    const digits = hex[1].length < 5 ? [...hex[1]].map(char => char + char).join('') : hex[1]
    return rgbToHsb(parseInt(digits.slice(0, 2), 16), parseInt(digits.slice(2, 4), 16), parseInt(digits.slice(4, 6), 16), digits.length === 8 ? parseInt(digits.slice(6), 16) / 255 : 1)
  }
  const fn = /^(rgba?|hsla?|hsba?)\(([^()]*)\)$/.exec(value)
  if (!fn) throw new Error('Unsupported color format')
  const parts = fn[2].trim().split(/\s*[,/]\s*|\s+/)
  if (parts.length !== 3 && parts.length !== 4) throw new Error('Invalid color channel count')
  const a = parts[3] === undefined ? 1 : token(parts[3], 1)
  if (fn[1].startsWith('rgb')) return rgbToHsb(token(parts[0], 255), token(parts[1], 255), token(parts[2], 255), a)
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:deg)?$/.test(parts[0])) throw new Error('Invalid hue')
  if (!Number.isFinite(parseFloat(parts[0]))) throw new Error('Invalid hue')
  const h = hue(parseFloat(parts[0])), s = token(parts[1], 100), third = token(parts[2], 100)
  if (fn[1].startsWith('hsb')) return { h, s, b: third, a }
  const brightness = third / 100 + s / 100 * Math.min(third / 100, 1 - third / 100)
  return { h, s: brightness ? 2 * (1 - third / 100 / brightness) * 100 : 0, b: brightness * 100, a }
}
/** Immutable color value; hue survives edits through gray and black. */
export class Color {
  private readonly channels: Required<ColorHsb>
  constructor(input: ColorInput) { this.channels = Object.freeze(parse(input)) }
  toHsb(): Required<ColorHsb> { return { ...this.channels } }
  toRgb(): Required<ColorRgb> {
    const { h, s, b, a } = this.channels, saturation = s / 100, value = b / 100
    const f = (n: number) => { const k = (n + h / 60) % 6; return Math.round(255 * (value - value * saturation * Math.max(0, Math.min(k, 4 - k, 1)))) }
    return { r: f(5), g: f(3), b: f(1), a }
  }
  toHexString(): string {
    const { r, g, b, a } = this.toRgb()
    return '#' + [r, g, b, ...(a < 1 ? [Math.round(a * 255)] : [])].map(n => n.toString(16).padStart(2, '0')).join('')
  }
  toRgbString(): string { const { r, g, b, a } = this.toRgb(); return a < 1 ? `rgba(${r}, ${g}, ${b}, ${round(a, 3)})` : `rgb(${r}, ${g}, ${b})` }
  toHsbString(): string { const { h, s, b, a } = this.channels; return `${a < 1 ? 'hsba' : 'hsb'}(${round(h)}, ${round(s)}%, ${round(b)}%${a < 1 ? `, ${round(a, 3)}` : ''})` }
  toCssString(): string { return this.toRgbString() }
  toString(format: ColorFormat = 'hex'): string { return format === 'rgb' ? this.toRgbString() : format === 'hsb' ? this.toHsbString() : this.toHexString() }
}
export const parseColor = (input: ColorInput): Color | undefined => { try { return new Color(input) } catch { return undefined } }
