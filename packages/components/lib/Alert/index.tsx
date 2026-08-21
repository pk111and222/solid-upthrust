import { Component,  Show, createMemo, createSignal } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createAlert, type AlertIns } from 'upthrust-competence'
import { alertContainerClass, alertIconClass, alertMessageClass, alertDescriptionClass, alertCloseClass } from './styles'

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

  const hasDescription = createMemo(() => !!props.description)
  const showIcon = createMemo(() => props.showIcon ?? true)
  const closable = createMemo(() => props.closable ?? false)
  const alertType = createMemo(() => props.type ?? 'info')

  const handleClose = (e: MouseEvent) => {
    setClosed(true)
    props.onClose?.(e)
    props.afterClose?.()
  }

  props.ref?.(refs)

  return <Show when={!closed()}>
    <div
      ref={alert}
      class={alertContainerClass({
        type: alertType(),
        hasDescription: hasDescription(),
        banner: props.banner,
      })}
    >
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
        <div class="ml-[8px]">{props.action}</div>
      </Show>
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
