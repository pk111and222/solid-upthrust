import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createMemo, merge } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import { createRate } from 'upthrust-competence'
import { useFormItem } from '../Input/context'
import {
  rateCharacterWrapClass,
  rateIconBaseWrapClass,
  rateIconFilledWrapClass,
  rateListClass,
  rateWrapperClass,
} from './styles'

export interface RateProps {
  /** Controlled rating. */
  value?: number
  defaultValue?: number
  /** Number of characters. Default 5. */
  count?: number
  /** Allow half-star values. */
  allowHalf?: boolean
  /** Re-clicking the current value resets to 0. */
  allowClear?: boolean
  disabled?: boolean
  /** Custom character (defaults to a star icon). */
  character?: JSX.Element
  /** Character size in px. Default 20 (rateStarSize). */
  id?: string
  class?: string
  style?: JSX.CSSProperties
  onChange?: (value: number) => void
  onHoverChange?: (value: number) => void
  ref?: (el: HTMLUListElement) => void
}

/**
 * Rate — the antd-style star rater.
 *
 * The headless createRate rides the SHARED createNumericValue machine
 * (min=0, max=count, step=0.5|1 — the same engine under InputNumber and
 * Slider). This layer renders the characters and feeds pointer positions:
 * each cell reports a fractional position (n - 0.5 for the left half, n
 * for the right) which the machine snaps to the lattice.
 */
const Rate: Component<RateProps> = providedProps => {
  const rawProps = useComponentProps('Rate', providedProps)
  const props = merge({}, rawProps)

  const form = useFormItem({
    get value() { return props.value },
    get onChange() { return props.onChange },
    get disabled() { return props.disabled },
    get id() { return props.id },
    get size() { return undefined },
    get status() { return undefined },
  })

  const machine = createMemo(() => createRate({
    get value() { return form.value() as number | undefined },
    get defaultValue() { return props.defaultValue },
    get count() { return props.count },
    get allowHalf() { return props.allowHalf },
    get allowClear() { return props.allowClear },
    get disabled() { return form.disabled() },
    get onChange() { return props.onChange },
    get onHoverChange() { return props.onHoverChange },
  }))

  const star = (filled: boolean) => (
    <span class={filled ? 'i-mdi-star' : 'i-mdi-star-outline'} />
  )

  /** Clip width (percent) of the filled overlay for character n (1-based). */
  const fillPercent = (n: number): number => {
    const v = machine().displayValue()
    if (v >= n) return 0 // fully — no clip
    if (v <= n - 1) return 100 // empty — fully clipped (hidden)
    // Partial: clip the RIGHT side so only the filled fraction shows.
    return (1 - (v - (n - 1))) * 100
  }

  const handleMove = (e: MouseEvent & { currentTarget: HTMLElement }, n: number) => {
    // Which half of the cell the pointer is in.
    const rect = e.currentTarget.getBoundingClientRect()
    const inRightHalf = e.clientX - rect.left > rect.width / 2
    const position = props.allowHalf && !inRightHalf ? n - 0.5 : n
    machine().hoverAt(position)
  }

  const handleClick = (e: MouseEvent & { currentTarget: HTMLElement }, n: number) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const inRightHalf = e.clientX - rect.left > rect.width / 2
    const position = props.allowHalf && !inRightHalf ? n - 0.5 : n
    machine().clickAt(position)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const m = machine()
    if (m.isDisabled()) return
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault()
        m.stepBy(1)
        break
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault()
        m.stepBy(-1)
        break
      case '0':
        e.preventDefault()
        m.reset()
        break
    }
  }

  const listRef: { current?: HTMLUListElement } = {}
  const setListRef = (el: HTMLUListElement) => {
    listRef.current = el
    props.ref?.(el)
  }

  return (
    <ul
      ref={setListRef}
      class={twMerge(
        rateWrapperClass({ disabled: machine().isDisabled() }),
        props.class,
      )}
      style={props.style}
      role="radiogroup"
      aria-disabled={machine().isDisabled() ? 'true' : 'false'}
      onMouseLeave={() => machine().leaveHover()}
      onKeyDown={handleKeyDown}
      tabindex={machine().isDisabled() ? -1 : 0}
    >
      <For each={Array.from({ length: machine().count() }, (_, i) => i + 1)}>
        {n => (
          <li
            class={rateCharacterWrapClass({ disabled: machine().isDisabled() })}
            role="radio"
            aria-checked={machine().value() >= n ? 'true' : 'false'}
            aria-label={`${n} 星`}
            onMouseMove={e => handleMove(e, n)}
            onMouseLeave={() => machine().leaveHover()}
            onClick={e => handleClick(e, n)}
          >
            <span class={rateIconBaseWrapClass({ disabled: machine().isDisabled() })}>
              {props.character ?? star(false)}
            </span>
            <span
              class={rateIconFilledWrapClass({ disabled: machine().isDisabled() })}
              style={{
                'clip-path': `inset(0 ${fillPercent(n)}% 0 0)`,
                '-webkit-clip-path': `inset(0 ${fillPercent(n)}% 0 0)`,
              }}
            >
              {props.character ?? star(true)}
            </span>
          </li>
        )}
      </For>
    </ul>
  )
}

export default Rate
