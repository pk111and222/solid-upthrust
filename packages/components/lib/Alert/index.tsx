import { Component,  Show, createMemo, createSignal, onCleanup } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createAlert, type AlertIns } from 'upthrust-competence'
import { alertContainerClass, alertContentClass, alertIconClass, alertMessageClass, alertDescriptionClass, alertCloseClass, alertActionClass } from './styles'

type AlertType = 'success' | 'info' | 'warning' | 'error'

export interface AlertProps {
  type?: AlertType
  message?: JSX.Element
  description?: JSX.Element
  showIcon?: boolean
  closable?: boolean
  banner?: boolean
  icon?: JSX.Element
  action?: JSX.Element
  onClose?: (e: Event) => void
  afterClose?: () => void
  children?: JSX.Element
  ref?: (val: AlertIns) => void
}

const Alert: Component<AlertProps> = (props = {}) => {
  const {alert, close, status, refs} = createAlert({onClose: props?.onClose})
  const [closed, setClosed] = createSignal(false)
  const [closing, setClosing] = createSignal(false)
  // Element captured from the container ref for transitionend targeting.
  let containerEl: HTMLDivElement | undefined

  const hasDescription = createMemo(() => !!props.description)
  const showIcon = createMemo(() => props.showIcon ?? true)
  const closable = createMemo(() => props.closable ?? false)
  const alertType = createMemo(() => props.type ?? 'info')

  // Leave sequencing: flip `closing` (fade + padding/border collapse), wait
  // out the transition window, THEN unmount via `closed`. afterClose fires
  // only after the element is gone (antd parity).
  let leaveTimer: ReturnType<typeof setTimeout> | undefined
  const handleClose = (e: MouseEvent) => {
    if (closing()) return
    setClosing(true)
    props.onClose?.(e)
    if (leaveTimer) clearTimeout(leaveTimer)
    // Belt-and-braces timer alongside onTransitionEnd (transitionend can be
    // swallowed by property filtering when the element has no computed change
    // for a listed property).
    leaveTimer = setTimeout(() => {
      leaveTimer = undefined
      setClosed(true)
      props.afterClose?.()
    }, 250)
  }

  props.ref?.(refs)
  onCleanup(() => { if (leaveTimer) clearTimeout(leaveTimer) })

  return <Show when={!closed()}>
    <div
      ref={(el) => { containerEl = el as HTMLDivElement; alert(el) }}
      class={alertContainerClass({
        type: alertType(),
        hasDescription: hasDescription(),
        banner: props.banner,
        closing: closing(),
      })}
      onTransitionEnd={(e) => {
        if (closing() && e.target === containerEl) {
          if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = undefined }
          setClosed(true)
          props.afterClose?.()
        }
      }}
    >
      <div class={alertContentClass({ closing: closing(), hasDescription: hasDescription() })}>
        <Show when={showIcon() && !props.icon}>
          <div class={alertIconClass({ type: alertType(), hasDescription: hasDescription() })} />
        </Show>
        <Show when={showIcon() && props.icon}>
          <div class="shrink-0 mr-[8px]">{props.icon}</div>
        </Show>
        <div class="flex-1 min-w-0">
          <div class={alertMessageClass({ hasDescription: hasDescription() })}>
            {props.message || props.children}
          </div>
          <Show when={hasDescription()}>
            <div class={alertDescriptionClass({})}>
              {props.description}
            </div>
          </Show>
        </div>
        <Show when={props.action}>
          <div class={alertActionClass({ closable: closable() })}>{props.action}</div>
        </Show>
      </div>
      <Show when={closable()}>
        <button
          ref={close}
          class={alertCloseClass({ hasDescription: hasDescription() })}
          onClick={handleClose}
        >
          <div class="i-mdi-close text-[14px]" />
        </button>
      </Show>
    </div>
  </Show>
}

export default Alert
