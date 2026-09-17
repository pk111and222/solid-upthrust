import { useComponentProps } from '../ConfigProvider/context'
import { Component, Show, createMemo, merge } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import { createSwitch } from 'upthrust-competence'
import type { SizeType } from '../../common/type'
import { useFormItem } from '../Input/context'
import { switchClass, switchHandleClass, switchInnerClass } from './styles'

export interface SwitchProps {
  /** Controlled checked. */
  checked?: boolean
  defaultChecked?: boolean
  /** Alias of checked. */
  value?: boolean
  defaultValue?: boolean
  checkedChildren?: JSX.Element
  unCheckedChildren?: JSX.Element
  disabled?: boolean
  loading?: boolean
  size?: SizeType
  id?: string
  autofocus?: boolean
  name?: string
  class?: string
  style?: JSX.CSSProperties
  onChange?: (checked: boolean, event?: Event) => void
  onClick?: (checked: boolean, event: Event) => void
  ref?: (el: HTMLButtonElement) => void
}

/**
 * Switch — the antd-style toggle.
 *
 * The headless createSwitch owns the checked state machine (controlled or
 * not, loading/disabled gates); this layer renders the track + sliding
 * handle. Form.Item integration: the value is boolean — context fills
 * checked/disabled/id; onChange receives `checked` (value-first contract).
 */
const Switch: Component<SwitchProps> = providedProps => {
  const rawProps = useComponentProps('Switch', providedProps)
  const props = merge({}, rawProps)

  const form = useFormItem({
    get value() { return props.value ?? props.checked },
    get onChange() {
      return (next: any, event?: Event) => props.onChange?.(!!next, event)
    },
    get disabled() { return props.disabled },
    get id() { return props.id },
    get size() { return props.size },
    get status() { return undefined },
  })

  const resolvedSize = () => props.size ?? form.size() ?? 'middle'
  const resolvedDisabled = () => form.disabled()

  const machine = createMemo(() => createSwitch({
    get checked() { return (form.value() as boolean | undefined) ?? undefined },
    get defaultChecked() { return props.defaultChecked ?? props.defaultValue },
    get disabled() { return resolvedDisabled() },
    get loading() { return props.loading },
    get onChange() { return form.onChange },
  }))

  const buttonRef: { current?: HTMLButtonElement } = {}
  const setRef = (el: HTMLButtonElement) => {
    buttonRef.current = el
    props.ref?.(el)
  }

  const handleClick = (e: MouseEvent) => {
    machine().toggle(e)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    // antd/rc-switch keyboard: Enter toggles (native button behavior);
    // Space is left to the browser default (also a click).
    if (e.key === 'Enter') {
      e.preventDefault()
      machine().toggle(e)
    }
  }

  const handleSize = () => resolvedSize() === 'small' ? 'small' : 'middle'
  const handleLeft = () => {
    // antd: trackPadding 2px; checked = calc(100% - handleSize - 2px).
    return machine().checked()
      ? 'calc(100% - 18px)'
      : '2px'
  }

  return (
    <button
      ref={setRef}
      type="button"
      role="switch"
      aria-checked={machine().checked() ? 'true' : 'false'}
      id={form.id()}
      name={props.name}
      disabled={resolvedDisabled()}
      autofocus={props.autofocus || undefined}
      class={twMerge(
        switchClass({
          checked: machine().checked(),
          size: handleSize(),
          disabled: !!resolvedDisabled(),
          loading: !!props.loading,
        }),
        props.class,
      )}
      style={{ ...props.style, 'padding-inline-start': '0', 'padding-inline-end': '0' }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span
        class={switchInnerClass({ size: handleSize(), checked: machine().checked() })}
      >
        <span class="transition-upthrust whitespace-nowrap">
          <Show when={machine().checked()} fallback={<span>{props.unCheckedChildren}</span>}>
            <span>{props.checkedChildren}</span>
          </Show>
        </span>
      </span>
      <span
        class={switchHandleClass({ size: handleSize() })}
        style={{ 'inset-inline-start': handleLeft() }}
      >
        <Show when={props.loading}>
          <span class="i-mdi-loading animate-spin-upthrust text-[8px] text-on-surface/45" />
        </Show>
      </span>
    </button>
  )
}

export default Switch
