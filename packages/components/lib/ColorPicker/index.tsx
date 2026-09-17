import { useComponentProps } from '../ConfigProvider/context'
import { createEffect, createSignal, For, Show, untrack } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import { Color, createColorPicker, parseColor, type ColorFormat, type ColorInput, type ColorPickerConfig } from 'upthrust-competence'
import Popover, { type PopoverPlacement } from '../Popover'
import { useFormItem } from '../Input/context'
import { colorTriggerClass, colorPanelClass, colorInputClass, colorActionClass, checkerboard, colorCheckIconClass, colorClearIconClass, colorRangeClass } from './styles'
export { Color, parseColor }
export type { ColorInput, ColorFormat, ColorRgb, ColorHsb, ColorPickerIns } from 'upthrust-competence'
export interface ColorPickerPreset { label: string; colors: readonly ColorInput[] }
export interface ColorPickerProps extends ColorPickerConfig {
  presets?: readonly ColorPickerPreset[]
  showText?: boolean | ((color: Color | null) => JSX.Element)
  size?: 'small' | 'middle' | 'large'
  status?: 'error' | 'warning'
  inline?: boolean
  placement?: PopoverPlacement
  disabledFormat?: boolean
  id?: string
  name?: string
  'aria-label'?: string
  class?: string
  style?: JSX.CSSProperties
  panelClass?: string
}
const ColorPicker = (providedProps: ColorPickerProps) => {
  const props = useComponentProps('ColorPicker', providedProps)
  const form = useFormItem({
    get value() { return props.value }, get disabled() { return props.disabled },
    get id() { return props.id }, get size() { return props.size }, get status() { return props.status },
  })
  const machine = createColorPicker({
    get value() { return form.value() as ColorInput | null | undefined },
    get defaultValue() { return props.defaultValue },
    get disabled() { return form.disabled() },
    get disabledAlpha() { return props.disabledAlpha },
    get allowClear() { return props.allowClear },
    get format() { return props.format },
    get defaultFormat() { return props.defaultFormat },
    get open() { return props.open },
    get defaultOpen() { return props.defaultOpen },
    get onOpenChange() { return props.onOpenChange },
    get onFormatChange() { return props.onFormatChange },
    get onChangeComplete() { return props.onChangeComplete },
    get onClear() { return props.onClear },
    onChange: (color, css) => { form.onChange(color?.toHexString() ?? null); props.onChange?.(color, css) },
  })
  let trigger: HTMLButtonElement | undefined
  const Panel = () => {
    let panel!: HTMLDivElement
    createEffect(() => !props.inline, autofocus => { if (autofocus) panel.querySelector<HTMLInputElement>('input')?.focus() })
    const [text, setText] = createSignal(untrack(machine.text))
    const [invalid, setInvalid] = createSignal(false)
    createEffect(machine.text, value => { setText(value); setInvalid(false) })
    const submit = () => {
      if (text() === machine.text()) return
      const valid = machine.setColor(text())
      setInvalid(!valid)
      if (valid) setText(machine.text())
    }
    let plane!: HTMLDivElement, pointer: number | undefined
    const move = (event: PointerEvent) => {
      const rect = plane.getBoundingClientRect()
      if (rect.width && rect.height) machine.setSaturationBrightness((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height)
    }
    const finish = (event: PointerEvent) => {
      if (pointer !== event.pointerId) return
      pointer = undefined; if (plane.hasPointerCapture(event.pointerId)) plane.releasePointerCapture(event.pointerId)
      machine.complete()
    }
    const Range = (p: { label: string; channel: 'h' | 's' | 'b' | 'a'; max: number; style?: JSX.CSSProperties }) => <label class="flex items-center gap-2 mt-2">
      <span class="w-[44px] shrink-0 text-on-surface-variant">{p.label}</span>
      <input type="range" class={colorRangeClass} style={p.style ?? { background: p.channel === 's'
        ? `linear-gradient(to right, #fff, ${new Color({ h: machine.hsb().h, s: 100, b: 100 }).toHexString()})`
        : `linear-gradient(to right, #000, ${new Color({ ...machine.hsb(), b: 100, a: 1 }).toHexString()})` }} min={0} max={p.max} step={1}
        aria-label={p.label} disabled={form.disabled()} value={p.channel === 'a' ? Math.round(machine.hsb().a * 100) : machine.hsb()[p.channel]}
        onInput={e => { const value = Number(e.currentTarget.value); machine.setHsb({ [p.channel]: p.channel === 'a' ? value / 100 : value }, false); e.currentTarget.value = String(p.channel === 'a' ? machine.hsb().a * 100 : machine.hsb()[p.channel]) }}
        onChange={machine.complete} onPointerUp={machine.complete} onKeyUp={machine.complete} onBlur={machine.complete} />
    </label>
    return <div ref={panel} class={twMerge(colorPanelClass, 'max-h-[80vh] overflow-y-auto', props.panelClass)} aria-label="颜色面板" onKeyDown={e => {
      if (e.key === 'Escape' && !props.inline) { e.stopPropagation(); machine.setOpen(false); trigger?.focus() }
    }}>
      <div class="flex items-center justify-between mb-3"><strong>选择颜色</strong><Show when={props.allowClear}><button type="button" class={colorActionClass} disabled={form.disabled() || !machine.color()} onClick={machine.clear}>清除</button></Show></div>
      <div ref={plane} class="relative h-[156px] rounded overflow-hidden touch-none select-none" role="group" aria-label="拖动选择饱和度与亮度，也可使用下方滑块" aria-disabled={form.disabled() ? 'true' : 'false'}
        style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), ${new Color({ h: machine.hsb().h, s: 100, b: 100 }).toHexString()}`, cursor: form.disabled() ? 'not-allowed' : 'crosshair', opacity: form.disabled() ? 0.5 : 1 }}
        onPointerDown={e => { if (form.disabled() || e.button !== 0 || pointer !== undefined) return; e.preventDefault(); pointer = e.pointerId; plane.setPointerCapture(pointer); move(e) }}
        onPointerMove={e => { if (pointer === e.pointerId) move(e) }} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish}>
        <span class="absolute w-[12px] h-[12px] rounded-full border-2 border-solid border-white shadow pointer-events-none" style={{ left: `${machine.hsb().s}%`, top: `${100 - machine.hsb().b}%`, transform: 'translate(-50%, -50%)', background: machine.css() }} />
      </div>
      <Range label="色相" channel="h" max={359} style={{ background: 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)' }} />
      <Range label="饱和度" channel="s" max={100} />
      <Range label="亮度" channel="b" max={100} />
      <Show when={!props.disabledAlpha}><Range label="透明度" channel="a" max={100} style={{ background: `linear-gradient(to right, transparent, ${new Color({ ...machine.hsb(), a: 1 }).toHexString()}), repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 0 / 8px 8px` }} /></Show>
      <div class="flex items-center gap-2 mt-3">
        <select aria-label="颜色格式" class={twMerge(colorInputClass, 'w-[72px] shrink-0')} disabled={form.disabled() || props.disabledFormat} value={machine.format()} onChange={e => { machine.setFormat(e.currentTarget.value as ColorFormat); e.currentTarget.value = machine.format() }}>
          <option value="hex">HEX</option><option value="rgb">RGB</option><option value="hsb">HSB</option>
        </select>
        <input class={colorInputClass} aria-label="颜色值" aria-invalid={invalid() ? 'true' : 'false'} placeholder={machine.format() === 'hex' ? '#1677ff' : machine.format() === 'rgb' ? 'rgb(22, 119, 255)' : 'hsb(215, 91%, 100%)'} disabled={form.disabled()} value={text()}
          onInput={e => { setText(e.currentTarget.value); setInvalid(false) }} onBlur={submit} onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); submit() }
            if (e.key === 'Escape') { setText(machine.text()); setInvalid(false); e.stopPropagation() }
          }} />
      </div>
      <Show when={invalid()}><div role="alert" class="text-error text-[12px] mt-1">请输入有效的 HEX、RGB 或 HSB 颜色</div></Show>
      <For each={props.presets}>{preset => <div class="mt-3"><div class="text-on-surface-variant mb-2">{preset.label}</div><div class="flex flex-wrap gap-2">
        <For each={preset.colors}>{input => {
          const color = () => parseColor(input)
          const selected = () => !!color() && machine.color()?.toHexString() === color()?.toHexString()
          return <Show when={color()}><button type="button" class="relative w-[24px] h-[24px] rounded border border-solid border-outline-variant p-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40 disabled:cursor-not-allowed" style={checkerboard}
            aria-label={`预设颜色 ${color()!.toHexString()}`} aria-pressed={selected() ? 'true' : 'false'} disabled={form.disabled()} onClick={() => machine.setColor(color()!)}>
            <span class="absolute inset-0 rounded flex items-center justify-center" style={{ background: color()!.toCssString(), color: color()!.toHsb().b > 65 ? '#111' : '#fff' }}><Show when={selected()}><span class={colorCheckIconClass} /></Show></span>
          </button></Show>
        }}</For>
      </div></div>}</For>
    </div>
  }
  return <div class={twMerge('inline-block max-w-full', props.class)} style={props.style}>
    <Show when={props.name}><input type="hidden" name={props.name} value={machine.color()?.toHexString() ?? ''} disabled={form.disabled()} /></Show>
    <Show when={props.inline} fallback={<Popover trigger="click" placement={props.placement ?? 'bottomLeft'} open={machine.open()} onOpenChange={machine.setOpen} disabled={form.disabled()} overlayClass="[&>div]:p-0" content={<Show when={machine.open()}><Panel /></Show>}>
      <button ref={trigger} id={form.id()} type="button" class={colorTriggerClass({ size: form.size() ?? 'middle', status: form.status() ?? 'default' })} disabled={form.disabled()} aria-label={props['aria-label'] ?? '选择颜色'} aria-haspopup="dialog" aria-expanded={machine.open() ? 'true' : 'false'} aria-invalid={form.status() === 'error' ? 'true' : undefined}
        onKeyDown={e => { if (e.key === 'Escape') machine.setOpen(false) }}>
        <span class="relative block w-[22px] h-[22px] rounded-sm overflow-hidden border border-solid border-outline-variant" style={checkerboard}>
          <span class="absolute inset-0 flex items-center justify-center" style={{ background: machine.css() }}><Show when={!machine.color()}><span class={twMerge(colorClearIconClass, 'text-on-surface-variant')} /></Show></span>
        </span>
        <Show when={props.showText}><span class="px-1">{typeof props.showText === 'function' ? props.showText(machine.color()) : machine.text() || '未选择'}</span></Show>
      </button>
    </Popover>}><Panel /></Show>
  </div>
}
export default ColorPicker
