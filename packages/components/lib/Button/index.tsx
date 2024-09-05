import { Component, JSX, Show, createMemo, splitProps, Ref } from 'solid-js'
import { SizeType } from '../../common/type'
import { createButton, buttonSplits, ButtonIns } from 'upthrust-competence'
import { buttonClass } from './styles'

type ButtonType = 'primary' | 'link' | 'text' | 'default' | 'danger' | 'dashed'
type ButtonSemantic = 'button' | 'loading' | 'text' | 'anchor'

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
  target?: HTMLAnchorElement['target'],
  rel?: HTMLAnchorElement['rel'],
  onClick?: (event: MouseEvent) => void,
  children?: JSX.Element
  ref?: (val: ButtonIns) => void
}

const Button: Component<ButtonProps> = (props = {}) => {
  const [buttonConfig, styleProps] = splitProps(props, buttonSplits)
  const {loading, disabled = false, button, anchor, refs} = createButton(buttonConfig)

  // 有icon时
  const _showIcon = createMemo(() => !!styleProps.icon)
  
  // 没有图标且loading为true
  const _showLoading = createMemo(() => !styleProps.icon && loading())

  // 判断是否是锚点展示
  const _isAnchor = createMemo(() => !!props.href)

  const _stylesChoice = createMemo(() => {
    return {
      type: styleProps.type,
      size: styleProps.size,
      block: styleProps.block,
      ghost: styleProps.ghost,
      danger: styleProps.danger,
      disabled: disabled,
      loading: loading(),
    }
  })

  props.ref?.(refs)
  
  return <button ref={button} class={buttonClass(_stylesChoice())} classList={props.classGroup?.button}>
      <Show when={_showLoading()}><div class='i-mdi-loading inline-block align-text-bottom animate-spin mr-2' classList={props.classGroup?.loading}></div></Show>
      <Show when={_showIcon()}>{props.icon}</Show>
      <Show when={_isAnchor()}><a ref={anchor} href={props.href} target={props.target || '_self'} rel={props.rel} classList={props.classGroup?.anchor}>{props.children}</a></Show>
      <Show when={!_isAnchor()}><span classList={props.classGroup?.text}>{props.children}</span></Show>
    </button>
};

export default Button