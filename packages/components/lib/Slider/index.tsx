import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createEffect, createMemo, merge, onCleanup, untrack } from 'solid-js'
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
  /** Accessible name; range handles append 起点/终点. */
  'aria-label'?: string
  'aria-labelledby'?: string
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
 * The headless createSlider owns value/clamp/snap/drag, using the shared
 * numeric core for start-value storage.
 * This layer renders the track and feeds pointer events in: percent ←
 * clientX against the rail's bounding rect; the keyboard rides stepHandle.
 */
const Slider: Component<SliderProps> = providedProps => {
  const rawProps = useComponentProps('Slider', providedProps)
  const props = merge({ min: 0, max: 100 }, rawProps)

  const form = useFormItem({
    get value() { return props.rangeValue ?? props.value },
    get onChange() { return isRange() ? props.onRangeChange : props.onChange },
    get disabled() { return props.disabled },
    get id() { return props.id },
    get size() { return undefined },
    get status() { return undefined },
  })

  const isRange = () => props.rangeValue !== undefined || props.defaultRangeValue !== undefined || Array.isArray(form.value())
  const machine = createSlider({
    get value() { return !isRange() ? form.value() as number | undefined : undefined },
    get defaultValue() { return props.defaultValue },
    get rangeValue() { return isRange() && Array.isArray(form.value()) ? form.value() as [number, number] : undefined },
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
    get onChange() { return form.onChange },
    get onRangeChange() { return form.onChange },
    // The headless signature includes null (drag-clearing); the UI never
    // produces one but the wrapper type must accept it.
    get onAfterChange() { return props.onAfterChange as ((value: number | null | [number, number]) => void) | undefined },
  })

  const railRef: { current?: HTMLDivElement } = {}
  const setRailRef = (el: HTMLDivElement) => {
    railRef.current = el
  }

  const wrapperRef: { current?: HTMLDivElement } = {}
  const setWrapperRef = (el: HTMLDivElement) => {
    wrapperRef.current = el
    untrack(() => props.ref?.(el))
  }

  /** clientX/clientY → 0..100 percent along the rail (axis & reverse aware). */
  const pointToPercent = (clientX: number, clientY: number): number => {
    const rail = railRef.current
    if (!rail) return 0
    const rect = rail.getBoundingClientRect()
    let pct: number
    if (rect.width === 0 || rect.height === 0) return 0
    if (props.vertical) {
      pct = ((rect.bottom - clientY) / rect.height) * 100
    } else {
      pct = ((clientX - rect.left) / rect.width) * 100
    }
    return Math.min(100, Math.max(0, pct))
  }

  let pointerId: number | null = null
  let pendingKeyboard = false
  const cleanupPointer = () => {
    const previous = pointerId
    pointerId = null
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onCancel)
    window.removeEventListener('blur', cancelPointer)
    if (previous !== null && wrapperRef.current?.hasPointerCapture?.(previous)) wrapperRef.current.releasePointerCapture(previous)
  }
  const cancelPointer = () => { cleanupPointer(); machine.cancelDrag() }
  const onMove = (event: PointerEvent) => {
    if (event.pointerId === pointerId) machine.dragTo(pointToPercent(event.clientX,event.clientY))
  }
  const onUp = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return
    cleanupPointer(); machine.endDrag()
  }
  const onCancel = (event: PointerEvent) => { if (event.pointerId === pointerId) cancelPointer() }
  onCleanup(() => { pendingKeyboard=false;cancelPointer() })
  createEffect(() => machine.isDisabled(), disabled => {
    if (disabled) { pendingKeyboard=false;cancelPointer() }
  })
  const handlePointerDown = (event: PointerEvent) => {
    if (machine.isDisabled() || event.button !== 0 || pointerId !== null) return
    event.preventDefault()
    const target = (event.target as Element).closest<HTMLElement>('[data-slider-handle]')
    const explicit = target?.dataset.sliderHandle === '0' ? 0 : target?.dataset.sliderHandle === '1' ? 1 : undefined
    const handle = machine.beginDrag(pointToPercent(event.clientX,event.clientY),explicit)
    wrapperRef.current?.querySelector<HTMLElement>(`[data-slider-handle="${handle}"]`)?.focus()
    pointerId=event.pointerId
    wrapperRef.current?.setPointerCapture?.(event.pointerId)
    window.addEventListener('pointermove',onMove)
    window.addEventListener('pointerup',onUp)
    window.addEventListener('pointercancel',onCancel)
    window.addEventListener('blur',cancelPointer)
  }
  const finishKeyboard = () => {
    if (!pendingKeyboard) return
    pendingKeyboard=false;machine.finishInteraction()
  }
  const keyboardKeys = new Set(['ArrowUp','ArrowRight','ArrowDown','ArrowLeft','Home','End'])
  const handleKeyDown = (event: KeyboardEvent, handle: 0 | 1) => {
    if (machine.isDisabled() || !keyboardKeys.has(event.key)) return
    event.preventDefault();pendingKeyboard=true
    if (event.key === 'Home') machine.snapToMin(handle)
    else if (event.key === 'End') machine.snapToMax(handle)
    else {
      const direction = event.key === 'ArrowUp' || event.key === 'ArrowRight' ? 1 : -1
      machine.stepHandle(handle,direction*(props.reverse ? -1 : 1)*(event.shiftKey ? 10 : 1))
    }
  }

  const vertical = () => !!props.vertical

  /** Inline geometry for the selection track: left/width (or bottom/height).
   *  The rail/track spans are top-1/2 centered (styles), so the track just
   *  positions horizontally and lets the class center it vertically. */
  const trackStyle = createMemo<JSX.CSSProperties>(() => {
    const [s, e] = machine.rangeValue()
    const ps = machine.percentOf(machine.isRange() ? s : machine.min())
    const pe = machine.percentOf(e)
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
    const pct = machine.percentOf(value)
    if (vertical()) {
      return { bottom: `calc(${pct}% - 5px)`, left: '50%', transform: 'translateX(-50%)' }
    }
    return { left: `calc(${pct}% - 5px)`, top: '50%', transform: 'translateY(-50%)' }
  }

  /** Mark dots sit ON the rail — same midline centering as the rail. */
  const markDotStyle = (value: number): JSX.CSSProperties => {
    const pct = machine.percentOf(value)
    if (vertical()) {
      return { bottom: `calc(${pct}% - 2px)`, left: '50%', transform: 'translateX(-50%)' }
    }
    return { left: `calc(${pct}% - 2px)`, top: '50%', transform: 'translateY(-50%)' }
  }

  const markLabelStyle = (value: number): JSX.CSSProperties => {
    const pct = machine.percentOf(value)
    if (vertical()) {
      return { bottom: `${pct}%`, left: '12px', transform: 'translateY(50%)' }
    }
    return { left: `${pct}%`, top: '14px', transform: 'translateX(-50%)' }
  }

  const isMarkPassed = (value: number) => {
    const [s, e] = machine.rangeValue()
    return value >= (machine.isRange() ? s : machine.min()) && value <= e
  }

  return (
    <div
      ref={setWrapperRef}
      id={form.id()}
      class={twMerge(
        sliderWrapperClass({ disabled: machine.isDisabled(), vertical: vertical() }),
        props.class,
      )}
      style={props.style}
      onPointerDown={handlePointerDown}
      onLostPointerCapture={onCancel}
    >
      <div ref={setRailRef} class="relative w-full h-full">
        <span class={sliderRailWrapClass({ vertical: vertical() })} />
        <span class={sliderTrackWrapClass({ vertical: vertical() })} style={trackStyle()} />
        <For each={machine.marks()}>
          {mark => (
            <span
              class={sliderMarkDotWrapClass({ passed: isMarkPassed(mark.value) })}
              style={markDotStyle(mark.value)}
            />
          )}
        </For>
        <For each={machine.marks()}>
          {mark => (
            <span
              class={sliderMarkLabelWrapClass({ passed: isMarkPassed(mark.value) })}
              style={markLabelStyle(mark.value)}
            >
              {mark.label ?? String(mark.value)}
            </span>
          )}
        </For>
        {/* Thumbs: range mode renders both, single mode only the start. */}
        <span
          class={sliderHandleWrapClass({ dragging: machine.draggingHandle() === 0 })}
          style={handleStyle(machine.rangeValue()[0])}
          data-slider-handle="0"
          aria-label={machine.isRange() ? `${props['aria-label'] ?? '范围'}起点` : props['aria-label'] ?? '滑块'}
          aria-labelledby={props['aria-labelledby']}
          aria-orientation={vertical() ? 'vertical' : 'horizontal'}
          role="slider"
          tabindex={machine.isDisabled() ? -1 : 0}
          aria-valuemin={machine.min()}
          aria-valuemax={machine.isRange() ? machine.rangeValue()[1] : machine.max()}
          aria-valuenow={machine.rangeValue()[0]}
          aria-disabled={machine.isDisabled() ? 'true' : 'false'}
          onKeyDown={e => handleKeyDown(e, 0)}
          onKeyUp={e => { if (keyboardKeys.has(e.key)) finishKeyboard() }}
          onBlur={finishKeyboard}
        />
        <Show when={machine.isRange()}>
          <span
            class={sliderHandleWrapClass({ dragging: machine.draggingHandle() === 1 })}
            style={handleStyle(machine.rangeValue()[1])}
            data-slider-handle="1"
            aria-label={`${props['aria-label'] ?? '范围'}终点`}
            aria-labelledby={props['aria-labelledby']}
            aria-orientation={vertical() ? 'vertical' : 'horizontal'}
            role="slider"
            tabindex={machine.isDisabled() ? -1 : 0}
            aria-valuemin={machine.rangeValue()[0]}
            aria-valuemax={machine.max()}
            aria-valuenow={machine.rangeValue()[1]}
            aria-disabled={machine.isDisabled() ? 'true' : 'false'}
            onKeyDown={e => handleKeyDown(e, 1)}
            onKeyUp={e => { if (keyboardKeys.has(e.key)) finishKeyboard() }}
            onBlur={finishKeyboard}
          />
        </Show>
      </div>
    </div>
  )
}

export default Slider
