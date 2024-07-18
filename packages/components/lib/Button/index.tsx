import { Component, JSX, Show, createMemo, splitProps } from 'solid-js'
import { SizeType } from '../../common/type'
import { createButton, buttonSplits } from 'upthrust-competence'
import { buttonClass } from './styles'

type ButtonType = 'primary' | 'link' | 'text' | 'secondary' | 'danger' | 'dashed'
type ButtonSemantic = 'button' | 'icon' | 'text'

export interface ButtonProps {
  classGroup?: Record<ButtonSemantic, Record<string, boolean>>
  type?: ButtonType,
  block?: boolean,
  danger?: boolean,
  disabled?: boolean,
  ghost?: boolean,
  href?: string,
  icon?: Component,
  loading?: boolean,
  shape?: 'default' | 'circle' | 'round',
  size?: SizeType,
  target?: string,
  onClick?: (event: MouseEvent) => void,
  children: JSX.Element
}

const Button: Component<ButtonProps> = (props) => {
  const [buttonConfig, styleProps] = splitProps(props, buttonSplits)
  const {loading, disabled, button} = createButton(buttonConfig)

  const _showIcon = createMemo(() => !!styleProps.icon && !loading)

  const _stylesChoice = createMemo(() => {
    return {
      disabled: disabled,
      type: styleProps.type,
      size: styleProps.size,
      block: styleProps.block,
      ghost: styleProps.ghost,
      danger: styleProps.danger,
    }
  })
  
  return <button ref={button} class={buttonClass(_stylesChoice())}>
      <Show when={loading}><span class='i-mdi-loading'></span></Show>
      <Show when={_showIcon}>{props.icon}</Show>
      <span>{props.children}</span>
    </button>
};

export default Button