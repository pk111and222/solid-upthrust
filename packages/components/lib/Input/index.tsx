import { createInput } from 'upthrust-competence'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, Show, createEffect, createMemo, merge } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import type { SizeType } from '../../common/type'
import { affixClass, clearIconClass, innerInputClass, inputClass, inputWrapperClass } from './styles'
import { useFormItem } from './context'

export interface InputProps {
  /** Input value (controlled); falls back to the surrounding Form.Item. */
  value?: string
  /** Uncontrolled initial value. */
  defaultValue?: string
  /**
   * Change handler. Receives the new VALUE (Solid convention, not the DOM
   * event) plus the raw event as a second arg. Wired to Form.Item when set
   * up as its child.
   */
  onChange?: (value: string, event?: Event) => void
  placeholder?: string
  disabled?: boolean
  size?: SizeType
  /** Prefix icon/text inside the input frame. */
  prefix?: JSX.Element
  /** Suffix icon/text inside the input frame. */
  suffix?: JSX.Element
  /** Show a clear button when non-empty. Default false. Can be customized with `{ clearIcon }`. */
  allowClear?: boolean | { clearIcon?: JSX.Element }
  /** Override the status derived from Form.Item validateStatus. */
  status?: 'error' | 'warning'
  id?: string
  name?: string
  type?: string
  maxLength?: number
  /** Character count shown at the end (antd showCount). */
  showCount?: boolean | { formatter?: (props: { value: string; count: number; maxLength?: number }) => string }
  readonly?: boolean
  class?: string
  style?: JSX.CSSProperties
  onFocus?: JSX.EventHandler<HTMLInputElement, FocusEvent>
  onBlur?: JSX.EventHandler<HTMLInputElement, FocusEvent>
  onPressEnter?: (e: KeyboardEvent) => void
  onCompositionStart?: JSX.EventHandler<HTMLInputElement, CompositionEvent>
  onCompositionEnd?: JSX.EventHandler<HTMLInputElement, CompositionEvent>
  ref?: (el: HTMLInputElement) => void
}

/**
 * Input — antd-aligned text input.
 *
 * DOM STABILITY CONTRACT (the focus-loss fix): the outer wrapper span is
 * ALWAYS rendered. prefix / suffix / clear icon / count live INSIDE it and
 * toggle with their own <Show> — only siblings after the <input> are added
 * or removed, never the <input> itself and never its parent. antd's own
 * dev warning ("dynamic add or remove prefix/suffix will make it lose
 * focus caused by dom structure change") is exactly the bug this avoids.
 */
const Input: Component<InputProps> = providedProps => {
  const rawProps = useComponentProps('Input', providedProps)
  // type is defaulted here but size is NOT: merge() fills defaults eagerly, so
  // a size default would shadow undefined and block Form.Item's context size
  // injection (useFormItem: explicit prop wins, context fills the rest).
  const props = merge({ type: 'text' }, rawProps)

  const form = useFormItem({
    get value() { return props.value },
    get onChange() { return props.onChange },
    get disabled() { return props.disabled },
    get id() { return props.id },
    get size() { return props.size },
    get status() { return props.status },
  })

  const state = createInput({
    get value() { const v = form.value(); return v === undefined ? undefined : String(v ?? '') },
    get defaultValue() { return props.defaultValue },
    get disabled() { return form.disabled() },
    get readonly() { return props.readonly },
    onChange: (value, event) => form.onChange(value, event),
  })
  const currentValue = state.value
  const handleChange = (e: Event) => state.input((e.currentTarget as HTMLInputElement).value, e)
  const handleCompositionEnd = (e: CompositionEvent & { currentTarget: HTMLInputElement; target: Element }) => {
    state.compositionEnd(e.currentTarget.value, e)
    props.onCompositionEnd?.(e)
  }

  const showClear = createMemo(
    () => !!props.allowClear && !!currentValue() && !form.disabled() && !props.readonly,
  )

  const resolvedSize = () => props.size ?? form.size() ?? 'middle'
  const resolvedStatus = () => form.status()

  const hasPrefix = () => props.prefix !== undefined
  // Suffix row: user suffix OR clear icon OR count — any of them switches the
  // frame to wrapper mode. showClear is part of this because a clearable
  // input always reserves the icon slot (antd keeps the icon mounted and
  // toggles visibility, so the mode never flips while typing).
  const hasSuffixRow = () => props.suffix !== undefined || !!props.allowClear || showCountOn()
  const wrapperMode = () => hasPrefix() || hasSuffixRow()
  // Affix-side padding layout (antd): the side WITH an affix shrinks to the
  // 4px gap, the bare side keeps the full frame padding — a suffix-only
  // input must keep its 11px left padding.
  const affixLayout = () =>
    hasPrefix() && hasSuffixRow() ? 'both' : hasPrefix() ? 'prefixOnly' : 'suffixOnly'

  const countNode = createMemo<JSX.Element>(() => {
    if (!showCountOn()) return undefined
    const value = currentValue() ?? ''
    const formatter = typeof props.showCount === 'object' ? props.showCount.formatter : undefined
    const text = formatter
      ? formatter({ value, count: value.length, maxLength: props.maxLength })
      : props.maxLength !== undefined
        ? `${value.length} / ${props.maxLength}`
        : String(value.length)
    return <span class="text-on-surface/25 tabular-nums">{text}</span>
  })
  function showCountOn() {
    return props.showCount !== undefined && props.showCount !== false
  }

  const inputRef: { current?: HTMLInputElement } = {}
  const setInputRef = (el: HTMLInputElement) => {
    inputRef.current = el
    props.ref?.(el)
  }

  // antd clear behaviour: reset value, then REFERENCE the input so typing
  // continues without a manual click (rc-input handleReset → focus()).
  const handleClear = (e: MouseEvent | KeyboardEvent) => {
    if (!showClear()) return
    e.preventDefault() // keep focus off the clear button itself
    e.stopPropagation()
    state.clear(e)
    inputRef.current?.focus()
  }

  createEffect(() => ({ value: currentValue(), revision: state.revision() }), ({ value }) => {
    if (inputRef.current && inputRef.current.value !== value) inputRef.current.value = value
  })

  const resolvedDisabled = () => form.disabled()

  return (
    <span
      class={twMerge(
        wrapperMode()
          ? inputWrapperClass({ size: resolvedSize(), status: resolvedStatus(), disabled: !!resolvedDisabled(), affixLayout: affixLayout() })
          : 'inline-flex w-full',
        props.class,
      )}
      style={props.style}
    >
      <Show when={hasPrefix()}>
        <span class={affixClass({ side: 'prefix', size: resolvedSize(), clickable: false })}>{props.prefix}</span>
      </Show>
      <input
        ref={setInputRef}
        id={form.id()}
        name={props.name}
        aria-invalid={resolvedStatus() === 'error' ? 'true' : undefined}
        type={props.type}
        value={currentValue()}
        placeholder={props.placeholder}
        disabled={resolvedDisabled()}
        readonly={props.readonly || undefined}
        maxlength={props.maxLength ?? undefined}
        autocomplete={props.type === 'password' ? 'new-password' : undefined}
        class={twMerge(
          wrapperMode()
            ? innerInputClass({ size: resolvedSize(), disabled: !!resolvedDisabled() })
            : inputClass({ size: resolvedSize(), status: resolvedStatus(), disabled: !!resolvedDisabled(), inWrapper: false }),
        )}
        onInput={handleChange}
        onFocus={e => props.onFocus?.(e)}
        onBlur={e => props.onBlur?.(e)}
        onCompositionStart={e => { state.compositionStart(); props.onCompositionStart?.(e) }}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={e => { if (e.key === 'Enter' && state.canEnter(e)) props.onPressEnter?.(e) }}
      />
      <Show when={hasSuffixRow()}>
        <span class={affixClass({ side: 'suffix', size: resolvedSize(), clickable: false })}>
          <Show
            when={showClear()}
            fallback={
              // keep the slot present but invisible (no reflow); antd toggles visibility only
              <span class={clearIconClass({ visible: false })} aria-hidden="true">
                <span class="i-mdi-close-circle-outline text-[12px]" />
              </span>
            }
          >
            <span
              class={clearIconClass({ visible: true })}
              onClick={handleClear}
              role="button"
              aria-label="clear"
              tabindex={0}
              onMouseDown={e => e.preventDefault()}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClear(e) } }}
            >
              {typeof props.allowClear === 'object' && props.allowClear.clearIcon
                ? props.allowClear.clearIcon
                : <span class="i-mdi-close-circle-outline text-[12px]" />}
            </span>
          </Show>
          {countNode()}
          {props.suffix}
        </span>
      </Show>
    </span>
  )
}

export default Input

// Keep source/Input usable for the same named family exports as the root entry.
export { default as InputPassword } from './Password'
export type { PasswordProps } from './Password'
export { default as InputTextArea } from './TextArea'
export type { TextAreaProps } from './TextArea'
export { default as InputSearch } from './Search'
export type { SearchProps } from './Search'
