import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createMemo, merge } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import { createSlider, type SliderMark } from 'upthrust-competence'
import { useFormItem } from '../Input/context'
import {
  sliderHandleWrapClass,
  sliderMarkDotWrapClass,
  sliderMarkLabelWrapClass,
  sliderRailWrapClass,
  sliderTrackWrapClass,
  sliderWrapperClass,
} from './styles'

export type { SliderMark }

export interface SliderProps {
  /** Controlled value (single thumb). */
  value?: number
  defaultValue?: number
  /** Controlled [start, end] — enables two-thumb range mode. */
  rangeValue?: [number, number]
  defaultRangeValue?: [number, number]
  min?: number
  max?: number
  /** Step between values; null = free (mark-only snapping). */
  step?: number | null
  precision?: number
  disabled?: boolean
  /** Right-to-left track. */
  reverse?: boolean
  /** Vertical track. */
  vertical?: boolean
  /** Value/label ticks; with marksOnly they become the pickable lattice. */
  marks?: SliderMark[]
  marksOnly?: boolean
  id?: string
  class?: string
  style?: JSX.CSSProperties
  onChange?: (value: number) => void
  onRangeChange?: (value: [number, number]) => void
  onAfterChange?: (value: number | [number, number]) => void
  ref?: (el: HTMLDivElement) => void
}

/**
 * Slider — the antd-style track picker.
 *
 * The headless createSlider (riding the SHARED createNumericValue machine —
 * the same engine under InputNumber and Rate) owns value/clamp/snap/drag.
 * This layer renders the track and feeds pointer events in: percent ←
 * clientX against the rail's bounding rect; the keyboard rides stepHandle.
 */
const Slider: Component<SliderProps> = providedProps => {
  const rawProps = useComponentProps('Slider', providedProps)
  const props = merge({ min: 0, max: 100 }, rawProps)

  const form = useFormItem({
    get value() { return props.value },
    get onChange() { return props.onChange },
    get disabled() { return props.disabled },
    get id() { return props.id },
    get size() { return undefined },
    get status() { return undefined },
  })

  const machine = createMemo(() => createSlider({
    get value() { return form.value() as number | undefined },
    get defaultValue() { return props.defaultValue },
    get rangeValue() { return props.rangeValue },
    get defaultRangeValue() { return props.defaultRangeValue },
    get min() { return props.min },
    get max() { return props.max },
    get step() { return props.step },
    get precision() { return props.precision },
    // Form-level disabled and the explicit prop both gate the machine —
    // form.disabled() folds the surrounding Item's disabled in.
    get disabled() { return props.disabled ?? form.disabled() },
    get reverse() { return props.reverse },
    get vertical() { return props.vertical },
    get marks() { return props.marks },
    get marksOnly() { return props.marksOnly },
    get onChange() { return props.onChange },
    get onRangeChange() { return props.onRangeChange },
    // The headless signature includes null (drag-clearing); the UI never
    // produces one but the wrapper type must accept it.
    get onAfterChange() { return props.onAfterChange as ((value: number | null | [number, number]) => void) | undefined },
  }))

  const railRef: { current?: HTMLDivElement } = {}
  const setRailRef = (el: HTMLDivElement) => {
    railRef.current = el
  }

  const wrapperRef: { current?: HTMLDivElement } = {}
  const setWrapperRef = (el: HTMLDivElement) => {
    wrapperRef.current = el
    props.ref?.(el)
  }

  /** clientX/clientY → 0..100 percent along the rail (axis & reverse aware). */
  const pointToPercent = (clientX: number, clientY: number): number => {
    const rail = railRef.current
    if (!rail) return 0
    const rect = rail.getBoundingClientRect()
    let pct: number
    if (props.vertical) {
      pct = ((rect.bottom - clientY) / rect.height) * 100
    } else {
      pct = ((clientX - rect.left) / rect.width) * 100
    }
    return Math.min(100, Math.max(0, pct))
  }

  const handlePointerDown = (e: PointerEvent) => {
    if (machine().isDisabled()) return
    e.preventDefault()
    const percent = pointToPercent(e.clientX, e.clientY)
    machine().beginDrag(percent)
    // Pointer capture keeps moves flowing even outside the rail.
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)

    const onMove = (ev: PointerEvent) => {
      machine().dragTo(pointToPercent(ev.clientX, ev.clientY))
    }
    const onUp = () => {
      machine().endDrag()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const handleKeyDown = (e: KeyboardEvent, handle: 0 | 1) => {
    const m = machine()
    if (m.isDisabled()) return
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault()
        m.stepHandle(handle, e.shiftKey ? 10 : 1)
        break
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault()
        m.stepHandle(handle, e.shiftKey ? -10 : -1)
        break
      case 'Home':
        e.preventDefault()
        m.snapToMin(handle)
        break
      case 'End':
        e.preventDefault()
        m.snapToMax(handle)
        break
    }
  }

  const vertical = () => !!props.vertical

  /** Inline geometry for the selection track: left/width (or bottom/height).
   *  The rail/track spans are top-1/2 centered (styles), so the track just
   *  positions horizontally and lets the class center it vertically. */
  const trackStyle = createMemo<JSX.CSSProperties>(() => {
    const [s, e] = machine().rangeValue()
    const ps = machine().percentOf(s)
    const pe = machine().percentOf(e)
    const start = Math.min(ps, pe)
    const size = Math.abs(pe - ps)
    if (vertical()) {
      return { bottom: `${start}%`, height: `${size}%`, left: 0, right: 0 }
    }
    return { left: `${start}%`, width: `${size}%` }
  })

  /** Inline geometry for a thumb: percent → left, vertically centered on the
   *  wrapper midline (top-1/2 translateY(-50%) like the rail). */
  const handleStyle = (value: number): JSX.CSSProperties => {
    const pct = machine().percentOf(value)
    if (vertical()) {
      return { bottom: `calc(${pct}% - 5px)`, left: '50%', transform: 'translateX(-50%)' }
    }
    return { left: `calc(${pct}% - 5px)`, top: '50%', transform: 'translateY(-50%)' }
  }

  /** Mark dots sit ON the rail — same midline centering as the rail. */
  const markDotStyle = (value: number): JSX.CSSProperties => {
    const pct = machine().percentOf(value)
    if (vertical()) {
      return { bottom: `calc(${pct}% - 2px)`, left: '50%', transform: 'translateX(-50%)' }
    }
    return { left: `calc(${pct}% - 2px)`, top: '50%', transform: 'translateY(-50%)' }
  }

  const markLabelStyle = (value: number): JSX.CSSProperties => {
    const pct = machine().percentOf(value)
    if (vertical()) {
      return { bottom: `${pct}%`, left: '12px', transform: 'translateY(50%)' }
    }
    return { left: `${pct}%`, top: '14px', transform: 'translateX(-50%)' }
  }

  const isMarkPassed = (value: number) => {
    const [s, e] = machine().rangeValue()
    return value >= s && value <= e
  }

  return (
    <div
      ref={setWrapperRef}
      class={twMerge(
        sliderWrapperClass({ disabled: machine().isDisabled(), vertical: vertical() }),
        props.class,
      )}
      style={props.style}
      onPointerDown={handlePointerDown}
    >
      <div ref={setRailRef} class="relative w-full h-full">
        <span class={sliderRailWrapClass({ vertical: vertical() })} />
        <span class={sliderTrackWrapClass({ vertical: vertical() })} style={trackStyle()} />
        <For each={machine().marks()}>
          {mark => (
            <span
              class={sliderMarkDotWrapClass({ passed: isMarkPassed(mark.value) })}
              style={markDotStyle(mark.value)}
            />
          )}
        </For>
        <For each={machine().marks()}>
          {mark => (
            <span
              class={sliderMarkLabelWrapClass({ passed: isMarkPassed(mark.value) })}
              style={markLabelStyle(mark.value)}
            >
              {mark.label ?? mark.value}
            </span>
          )}
        </For>
        {/* Thumbs: range mode renders both, single mode only the start. */}
        <span
          class={sliderHandleWrapClass({ dragging: machine().draggingHandle() === 0 })}
          style={handleStyle(machine().rangeValue()[0])}
          role="slider"
          tabindex={machine().isDisabled() ? -1 : 0}
          aria-valuemin={machine().min()}
          aria-valuemax={machine().max()}
          aria-valuenow={machine().rangeValue()[0]}
          aria-disabled={machine().isDisabled() ? 'true' : 'false'}
          onKeyDown={e => handleKeyDown(e, 0)}
        />
        <Show when={machine().isRange()}>
          <span
            class={sliderHandleWrapClass({ dragging: machine().draggingHandle() === 1 })}
            style={handleStyle(machine().rangeValue()[1])}
            role="slider"
            tabindex={machine().isDisabled() ? -1 : 0}
            aria-valuemin={machine().min()}
            aria-valuemax={machine().max()}
            aria-valuenow={machine().rangeValue()[1]}
            aria-disabled={machine().isDisabled() ? 'true' : 'false'}
            onKeyDown={e => handleKeyDown(e, 1)}
          />
        </Show>
      </div>
    </div>
  )
}

export default Slider
