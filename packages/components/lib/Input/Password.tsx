import { createPassword } from 'upthrust-competence'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, Show, merge } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import type { SizeType } from '../../common/type'
import { affixClass } from './styles'
import Input, { type InputProps } from './index'
import { useFormItem } from './context'

export interface PasswordProps extends Omit<InputProps, 'type' | 'suffix' | 'prefix'> {
  /** Whether to show the visibility toggle icon. Default true. */
  visibilityToggle?: boolean
  /** 'click' (default) or 'hover' triggers the toggle. */
  action?: 'click' | 'hover'
  /** Control the visibility from outside. */
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
}

/**
 * Input.Password — eye-icon visibility toggle riding the base Input.
 *
 * The eye renders as a real suffix through the base component, so the
 * focus-stable DOM contract is inherited for free. antd details preserved:
 * mousedown/mouseup are suppressed on the icon (keeps caret position, see
 * antd #15173/#23524), Enter/Space toggles with a button role.
 *
 * hover action: antd toggles on onMouseOver only (a boolean flip per entry).
 * The "hover out too fast, never toggles back" bug comes from toggling on
 * over alone — a quick sweep enters without leaving, leaving visible=true
 * forever. We pair onMouseOver with onMouseLeave restoring the pre-hover
 * state (antd's own demo lives with the quirk; we fix it).
 */
const Password: Component<PasswordProps> = providedProps => {
  const rawProps = useComponentProps('Password', providedProps)
  const props = merge(
    { visibilityToggle: true, action: 'click' as 'click' | 'hover' },
    rawProps,
  )

  const form = useFormItem({ get disabled() { return props.disabled } })
  const visibility = createPassword({
    get visible() { return props.visible },
    get disabled() { return form.disabled() },
    get action() { return props.action },
    onVisibleChange: next => props.onVisibleChange?.(next),
  })
  const visible = visibility.visible
  const toggle = visibility.toggle

  const eye = (
    <Show when={props.visibilityToggle}>
      <span
        role="button"
        tabindex={form.disabled() ? -1 : 0}
        aria-disabled={form.disabled() ? "true" : undefined}
        aria-label={visible() ? '隐藏密码' : '显示密码'}
        aria-pressed={visible() ? 'true' : 'false'}
        class={twMerge(
          affixClass({ side: 'prefix', clickable: false }),
          'text-on-surface/45', 'cursor-pointer', 'transition-upthrust-fast',
          'hover:text-on-surface', 'select-none',
          'focus-visible:outline-2', 'focus-visible:outline-offset-1', 'focus-visible:outline-primary/40',
        )}
        onMouseDown={e => e.preventDefault()}
        onMouseUp={e => e.preventDefault()}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggle()
          }
        }}
        onClick={() => { if (props.action === 'click') toggle() }}
        onMouseEnter={visibility.enter}
        onMouseLeave={visibility.leave}
      >
        <span class={visible() ? 'i-mdi-eye-outline text-[14px]' : 'i-mdi-eye-off-outline text-[14px]'} />
      </span>
    </Show>
  )

  const resolvedDisabled = () => props.disabled ?? form.disabled()

  return (
    <Input
      {...props}
      type={visible() ? 'text' : 'password'}
      disabled={resolvedDisabled()}
      suffix={eye}
    />
  )
}

export default Password
