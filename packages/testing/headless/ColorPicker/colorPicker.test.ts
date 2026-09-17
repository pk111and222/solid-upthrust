import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Color, parseColor, createColorPicker } from '../../../competence/src/colorPicker/index'

describe('Color conversions', () => {
  it.each([
    ['#f00', '#ff0000'], ['#0f08', '#00ff0088'], ['#11223344', '#11223344'],
    ['rgb(100% 0% 0% / 50%)', '#ff000080'], ['rgba(0, 128, 255, 0.2)', '#0080ff33'],
    ['hsl(120, 100%, 50%)', '#00ff00'], ['hsb(240, 100%, 100%)', '#0000ff'],
    ['transparent', '#00000000'], ['hsl(-120deg 100% 50%)', '#0000ff'],
  ])('parses %s', (input, expected) => expect(new Color(input).toHexString()).toBe(expected))
  it.each(['nope', '#12345', 'rgb(1,2)', 'rgb(1x,2,3)', 'hsl(no,20%,30%)', 'rgb(1,2,3,4,5)'])('rejects invalid %s', input => expect(parseColor(input)).toBeUndefined())
  it('round trips RGB channels without losing alpha', () => {
    for (const r of [0, 1, 70, 128, 254, 255]) for (const g of [0, 87, 255]) for (const b of [0, 154, 255]) {
      expect(new Color({ r, g, b, a: 0.37 }).toRgb()).toEqual({ r, g, b, a: 0.37 })
    }
  })
  it('keeps black/gray hue and protects the value from external mutation', () => {
    const input = { h: 270, s: 100, b: 0, a: 0.5 }, color = new Color(input)
    input.h = 0; const result = color.toHsb(); result.h = 0
    expect(color.toHsb().h).toBe(270)
    expect(new Color({ ...color.toHsb(), b: 100 }).toHexString()).toBe('#8000ff80')
    expect(parseColor({ r: NaN, g: 0, b: 0 })).toBeUndefined()
  })
})

describe('ColorPicker state', () => {
  it('supports empty initialization, format changes and same-batch HSB edits', () => createRoot(() => {
    const picker = createColorPicker()
    expect(picker.color()).toBeNull()
    picker.setHsb({ h: 120 }); picker.setHsb({ s: 100, b: 100 }); flush()
    expect(picker.text()).toBe('#00ff00')
    picker.setFormat('rgb'); flush(); expect(picker.text()).toBe('rgb(0, 255, 0)')
  }))
  it('keeps controlled values until the owner accepts a proposal', () => createRoot(() => {
    const onChange = vi.fn(), onChangeComplete = vi.fn()
    const picker = createColorPicker({ value: '#f00', onChange, onChangeComplete })
    picker.setColor('#00f', false); flush()
    expect(picker.text()).toBe('#ff0000'); expect(onChange.mock.calls[0][0].toHexString()).toBe('#0000ff')
    expect(onChangeComplete).not.toHaveBeenCalled(); picker.complete(); picker.complete()
    expect(onChangeComplete).toHaveBeenCalledTimes(1)
  }))
  it('tracks external changes and forces opaque output when alpha is disabled', () => createRoot(() => {
    const [value, setValue] = createSignal('#ff000080', { ownedWrite: true })
    const picker = createColorPicker({ get value() { return value() }, disabledAlpha: true })
    expect(picker.text()).toBe('#ff0000'); setValue('#00ff00'); flush(); expect(picker.text()).toBe('#00ff00')
  }))
  it('clamps plane coordinates, clears with null and completes once', () => createRoot(() => {
    const onChange = vi.fn(), onClear = vi.fn()
    const picker = createColorPicker({ defaultValue: '#fff', allowClear: true, onChange, onClear })
    picker.setSaturationBrightness(2, -1); flush(); expect(picker.hsb()).toMatchObject({ s: 100, b: 100 })
    picker.clear(); flush(); expect(picker.color()).toBeNull(); expect(onChange.mock.calls.at(-1)).toEqual([null, '']); expect(onClear).toHaveBeenCalledOnce()
  }))
  it('blocks disabled changes and keeps invalid input from overwriting the color', () => createRoot(() => {
    const onChange = vi.fn()
    const disabled = createColorPicker({ defaultValue: '#fff', disabled: true, allowClear: true, onChange })
    disabled.setColor('#000'); disabled.clear(); disabled.setOpen(true); disabled.setFormat('rgb'); flush()
    expect(disabled.text()).toBe('#ffffff'); expect(disabled.open()).toBe(false); expect(onChange).not.toHaveBeenCalled()
    const picker = createColorPicker({ defaultValue: '#fff' }); expect(picker.setColor('invalid')).toBe(false); expect(picker.text()).toBe('#ffffff')
  }))
  it('supports separately controlled open and format state', () => createRoot(() => {
    const onOpenChange = vi.fn(), onFormatChange = vi.fn()
    const picker = createColorPicker({ open: false, format: 'hex', onOpenChange, onFormatChange })
    picker.setOpen(true); picker.setFormat('hsb'); flush()
    expect(picker.open()).toBe(false); expect(picker.format()).toBe('hex')
    expect(onOpenChange).toHaveBeenCalledWith(true); expect(onFormatChange).toHaveBeenCalledWith('hsb')
  }))
})
