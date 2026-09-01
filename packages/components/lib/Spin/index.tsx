import { Component, Show, createEffect, createMemo, createSignal, merge, onCleanup } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { spinIndicatorClass, spinNestedClass, spinWrapperClass, spinBackdropClass, spinTipClass, spinContainerClass } from './styles'
import { twMerge } from 'tailwind-merge'
import type { SizeType } from '../../common/type'

export interface SpinProps {
  /** Spinner state; defaults true (a bare <Spin /> spins). */
  spinning?: boolean
  /** Debounce before the spinner appears, ms — avoids flicker on fast loads. */
  delay?: number
  size?: SizeType
  /** Text under the spinner (standalone mode) or over the backdrop (nested). */
  tip?: JSX.Element
  /** Custom indicator node replaces the default ring. */
  indicator?: JSX.Element
  /** Nested mode: children get the spinner overlay while spinning. */
  children?: JSX.Element
  wrapperClass?: string
  class?: string
  style?: JSX.CSSProperties
}

/**
 * Spin keeps no headless counterpart — the only "logic" is a small debounced
 * visibility state, inlined here:
 *  - `delay` defers the spinner's APPEARANCE (a flip to false hides
 *    immediately — antd semantics)
 *  - the initial appearance is debounced too when spinning starts on
 *    mount with a delay configured
 */
const Spin: Component<SpinProps> = (rawProps) => {
  const props = merge({ size: 'middle' as const, spinning: true }, rawProps)

  const sourceSpinning = createMemo(() => props.spinning ?? true)

  // Debounced visible state. Solid 2: write from createEffect (double-fn
  // form), never from a memo — writing a signal inside a computation halts
  // the reactive system. All reactive reads live in the compute function so
  // the effect callback stays untracked (STRICT_READ_UNTRACKED otherwise
  // fires on every props.delay/active read inside the callback).
  //
  // Initial state: visible = spinning, UNLESS a delay is configured AND the
  // source starts spinning (then the first appearance is debounced too —
  // a spinner that flashes for one frame defeats the delay's purpose).
  const initialVisible = sourceSpinning() && !(props.delay !== undefined && props.delay > 0)
  const [active, _setActive] = createSignal(initialVisible, { ownedWrite: true })
  // When debouncing the initial appearance, schedule the show timer now.
  let delayTimer: ReturnType<typeof setTimeout> | undefined
  if (!initialVisible && sourceSpinning() && props.delay && props.delay > 0) {
    delayTimer = setTimeout(() => {
      delayTimer = undefined
      if (sourceSpinning()) _setActive(true)
    }, props.delay)
  }

  createEffect(
    () => ({ spinning: sourceSpinning(), delay: props.delay ?? 0, visible: active() }),
    ({ spinning, delay, visible }, prev) => {
      // Initial run: the constructor seeded the right state already.
      if (prev === undefined) return
      if (delayTimer) { clearTimeout(delayTimer); delayTimer = undefined }
      if (spinning && delay > 0 && !visible) {
        // Debounced show: keeps short request flashes from flickering.
        delayTimer = setTimeout(() => {
          delayTimer = undefined
          if (sourceSpinning()) _setActive(true)
        }, delay)
        return
      }
      _setActive(spinning)
    },
  )
  onCleanup(() => { if (delayTimer) clearTimeout(delayTimer) })

  const nested = createMemo(() => props.children !== undefined)

  const indicatorNode = createMemo(() => props.indicator ?? (
    <span class={twMerge(spinIndicatorClass({ size: props.size }), 'text-primary')} />
  ))

  return (
    <Show
      when={nested()}
      fallback={
        <div class={twMerge(spinContainerClass({}), props.class)} style={props.style}>
          <div>{indicatorNode()}</div>
          <Show when={props.tip}>
            <div class={spinTipClass({})}>{props.tip}</div>
          </Show>
        </div>
      }
    >
      <div class={twMerge(spinNestedClass({ spinning: active() }), props.wrapperClass)}>
        {props.children}
        <div class={spinWrapperClass({ spinning: active() })}>
          <div class={spinBackdropClass({ spinning: active() })} />
          <div class="relative flex flex-col items-center">
            {indicatorNode()}
            <Show when={props.tip}>
              <div class={spinTipClass({})}>{props.tip}</div>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  )
}

export default Spin
