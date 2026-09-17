import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createEffect, createMemo, merge, untrack } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  createOwnerCleanup,
  createSegmented,
  type SegmentedIns,
  type SegmentedOption,
  type SegmentedRect,
} from 'upthrust-competence'
import { useFormItem } from '../Input/context'
import type { SizeType } from '../../common/type'
import { segmentedGroupClass, segmentedThumbClass, segmentedItemClass, segmentedItemIconClass } from './styles'

export type { SegmentedOption }

/** antd allows either { label, value } items or bare strings/numbers. */
export type SegmentedItem = string | number | SegmentedOption

export interface SegmentedProps {
  /** Controlled selected value. */
  value?: string | number
  defaultValue?: string | number
  /** Options (or bare values normalized into options). */
  options?: SegmentedItem[]
  disabled?: boolean
  /** Stretch to full width; items share it evenly. */
  block?: boolean
  size?: SizeType
  status?: 'error' | 'warning'
  id?: string
  class?: string
  style?: JSX.CSSProperties
  onChange?: (value: string | number) => void
  /** Escape hatch: the raw machine (imperative focus/measure control). */
  ref?: (machine: SegmentedIns) => void
}

const normalize = (items: SegmentedItem[]): SegmentedOption[] =>
  items.map(it => {
    if (typeof it === 'string' || typeof it === 'number') {
      return { label: String(it), value: it }
    }
    return it
  })

/**
 * Segmented — the antd-style pill picker with a sliding thumb.
 *
 * COMPOSITION: the value layer is the shared createSelection store (radio
 * semantics — maxSelect 1, clicking the selected item keeps it) riding
 * behind createSegmented; the thumb is measured geometry: every item
 * reports its offsetLeft/offsetWidth through a merged ref, the machine
 * derives the thumb box from the SELECTED (or keyboard-FOCUSED — antd
 * slides the thumb to the traversal candidate before commit) item, and
 * the renderer paints one absolutely positioned chip with a transition.
 */
const Segmented: Component<SegmentedProps> = (providedProps) => {
  const rawProps = useComponentProps('Segmented', providedProps)
  const props = merge(
    { size: 'middle' as SizeType, block: false } as Partial<SegmentedProps>,
    rawProps,
  )

  const form = useFormItem({
    get value() { return props.value },
    get onChange() { return props.onChange },
    get disabled() { return props.disabled },
    get id() { return props.id },
    get size() { return props.size },
    get status() { return props.status },
  })

  const resolvedDisabled = () => form.disabled()
  const resolvedSize = () => form.size() ?? 'middle'

  const options = createMemo<SegmentedOption[]>(() => normalize(props.options ?? []))

  const machine = createSegmented({
    get value() { return props.value as string | number | undefined },
    get defaultValue() { return props.defaultValue },
    get options() { return options() },
    get disabled() { return resolvedDisabled() },
    get block() { return props.block === true },
    get onChange() { return props.onChange },
  })
  const m = () => machine
  props.ref?.(machine)

  // ---- geometry -----------------------------------------------------------

  const itemRefs = new Map<string | number, HTMLElement>()
  const onOwnerCleanup = createOwnerCleanup()

  const measureItem = (key: string | number) => {
    const el = itemRefs.get(key)
    const parent = el?.offsetParent as HTMLElement | null
    if (!el || !parent) return
    m().setItemRect(key, {
      left: el.offsetLeft,
      width: el.offsetWidth,
    })
  }

  const measureAll = () => {
    for (const o of options()) measureItem(o.value)
  }

  const setItemRef = (key: string | number) => (el: HTMLElement) => {
    itemRefs.set(key, el)
    // Refs run before layout; measure post-paint (rAF defers past the
    // attribute effects and gives the browser a chance to lay out).
    queueMicrotask(() => measureItem(key))
  }

  // Re-measure whenever the selection/focus/options/geometry inputs change.
  createEffect(
    () => [options(), props.block, props.size],
    () => queueMicrotask(measureAll),
  )

  // Keep aligned through container resize (block mode especially).
  const resizeObserverSupported = typeof ResizeObserver !== 'undefined'
  let groupEl: HTMLElement | undefined
  const setGroupRef = (el: HTMLElement) => {
    groupEl = el
    if (!resizeObserverSupported) return
    const ro = new ResizeObserver(() => measureAll())
    ro.observe(el)
    onOwnerCleanup(() => ro.disconnect())
  }

  const thumbStyle = createMemo<JSX.CSSProperties>(() => {
    const r = m().thumbRect()
    if (!r) return { opacity: 0 }
    return {
      left: `${r.left}px`,
      width: `${r.width}px`,
      opacity: 1,
    } as JSX.CSSProperties
  })

  // ---- keyboard -----------------------------------------------------------

  const handleKeyDown = (e: KeyboardEvent) => {
    if (resolvedDisabled()) return
    const mm = m()
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        mm.moveFocus(-1)
        return
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        mm.moveFocus(1)
        return
      case 'Home':
        e.preventDefault()
        mm.focusEdge('first')
        return
      case 'End':
        e.preventDefault()
        mm.focusEdge('last')
        return
      case 'Enter':
      case ' ': {
        const f = untrack(mm.focusValue)
        if (f !== undefined) {
          e.preventDefault()
          mm.select(f)
        }
        return
      }
      case 'Escape':
        mm.setFocusValue(undefined)
        return
    }
  }

  const handleBlur = () => m().setFocusValue(undefined)

  return (
    <div
      ref={setGroupRef}
      class={twMerge(
        segmentedGroupClass({
          size: resolvedSize(),
          block: props.block === true,
          disabled: !!resolvedDisabled(),
        }),
        props.class,
      )}
      style={props.style}
      role="radiogroup"
      tabindex={resolvedDisabled() ? -1 : 0}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      aria-disabled={resolvedDisabled() ? 'true' : 'false'}
    >
      {/* The shared sliding thumb — behind the items (z-0 vs items' z-[1]). */}
      <div class={segmentedThumbClass()} style={thumbStyle()} aria-hidden="true" />
      <For each={options()}>
        {(opt) => {
          const selected = () => m().isSelected(opt.value)
          const focused = () => m().thumbValue() === opt.value
          const disabled = () => resolvedDisabled() || m().isDisabled(opt.value)
          return (
            <div
              ref={setItemRef(opt.value)}
              class={segmentedItemClass({
                size: resolvedSize(),
                selected: !!selected(),
                disabled: !!disabled(),
                focused: !!focused(),
                block: props.block === true,
              })}
              role="radio"
              aria-checked={selected() ? 'true' : 'false'}
              aria-disabled={disabled() ? 'true' : 'false'}
              onClick={() => {
                if (disabled()) return
                m().select(opt.value)
              }}
              onMouseEnter={() => {
                // antd slides the thumb to the hover target only when it is
                // pickable; keep the value until click commits.
                if (!disabled() && !selected()) m().setFocusValue(opt.value)
              }}
              onMouseLeave={() => {
                if (untrack(() => m().focusValue()) === opt.value) m().setFocusValue(undefined)
              }}
            >
              <Show when={opt.icon}>
                <span class={segmentedItemIconClass()}>{opt.icon as JSX.Element}</span>
              </Show>
              {opt.label}
            </div>
          )
        }}
      </For>
    </div>
  )
}

export default Segmented
