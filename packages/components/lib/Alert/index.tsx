import { Component, JSX, Show, createMemo, splitProps, Ref } from 'solid-js'
import { createAlert, type AlertIns } from 'upthrust-competence'
import { isString } from 'lodash'
import { alertClass } from './styles'

type AlertType = 'primary' | 'default' | 'danger' | 'dashed'
type AlertSemantic = 'button' | 'icon' | 'text' | ''
type IconMap = 'info' | 'success' | 'warning' | 'error' | 'wait'

export interface AlertProps {
  classGroup?: Record<AlertSemantic, Record<string, boolean>>
  type?: AlertType,
  action?: Component
  showIcon?: boolean,
  icon?: JSX.Element | IconMap,
  onClose?: (e: Event) => void,
  afterClose?: () => void,
  closable?: boolean,
  message?: string,
  description?: string,
  children?: JSX.Element
  ref?: (val: AlertIns) => void
}

const Alert: Component<AlertProps> = (props = {}) => {
  const {alert, close, status, refs} = createAlert({onClose: props?.onClose })

  const _showIcon = createMemo(() => props.showIcon ?? true)
  const _showClose = createMemo(() => props.closable ?? true)

  const _icon = createMemo(() => {
    if (!props.icon) return null
    if (!isString(props.icon)) return props.icon as JSX.Element
    return <div class='inline-flex items-center'></div>
  })

  return <div ref={alert} class=''>
    <div class='flex items-center'>
      <Show when={_showIcon && _icon}>
        <div class='inline-flex '>
          {_icon()}
        </div>
      </Show>
      <div class='flex-1'>
      <Show when={_showClose}>
        <button ref={close} class=''></button>
      </Show>
    </div>
    </div>
  </div>
}

export default Alert