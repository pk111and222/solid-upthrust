import { Component,  Show, createMemo } from 'solid-js'
import type { JSX } from '@solidjs/web'
import type { SizeType } from '../../common/type'
import { createButton, ButtonIns, type ButtonVariant, type ButtonColor } from 'upthrust-competence'
import { buttonClass, waveClass, type ButtonStyleVariants } from './styles'

type ButtonType = 'primary' | 'link' | 'text' | 'default' | 'dashed'
type ButtonShape = 'default' | 'circle' | 'round'
type ColorScheme = `${ButtonVariant}-${ButtonColor}`

export interface ButtonProps {
  variant?: ButtonVariant
  color?: ButtonColor
  type?: ButtonType
  block?: boolean
  danger?: boolean
  disabled?: boolean
  ghost?: boolean
  href?: string
  icon?: JSX.Element
  iconPlacement?: 'start' | 'end'
  loading?: boolean | { delay: number }
  shape?: ButtonShape
  size?: SizeType
  target?: HTMLAnchorElement['target']
  rel?: HTMLAnchorElement['rel']
  onClick?: (event: MouseEvent) => void
  children?: JSX.Element
  ref?: (val: ButtonIns) => void
}

const TYPE_MAP: Record<ButtonType, { variant: ButtonVariant; color: ButtonColor }> = {
  primary: { variant: 'solid', color: 'primary' },
  default: { variant: 'outlined', color: 'default' },
  dashed: { variant: 'dashed', color: 'default' },
  text: { variant: 'text', color: 'default' },
  link: { variant: 'link', color: 'default' },
}

const Button: Component<ButtonProps> = (props = {}) => {
  const {loading, disabled = false, waveActive, button, anchor, refs} = createButton(props as any)

  const resolvedVariant = createMemo((): ButtonVariant => {
    if (props.variant) return props.variant
    const typeKey = props.type || 'default'
    return TYPE_MAP[typeKey].variant
  })

  const resolvedColor = createMemo((): ButtonColor => {
    if (props.danger) return 'danger'
    if (props.color) return props.color
    const typeKey = props.type || 'default'
    return TYPE_MAP[typeKey].color
  })

  const colorScheme = createMemo((): ColorScheme => `${resolvedVariant()}-${resolvedColor()}`)

  const _isAnchor = createMemo(() => !!props.href)
  const _showLoading = createMemo(() => loading())
  const _iconPlacement = createMemo(() => props.iconPlacement || 'start')

  const _styleChoice = createMemo((): ButtonStyleVariants => ({
    colorScheme: colorScheme(),
    size: props.size || 'middle',
    shape: props.shape || 'default',
    disabled: !!disabled,
    ghost: props.ghost || false,
    block: props.block || false,
    loading: loading(),
  }))

  const _needsWave = createMemo(() => {
    const v = resolvedVariant()
    return v !== 'link' && v !== 'text'
  })

  props.ref?.(refs)

  const iconNode = createMemo(() => {
    if (_showLoading()) {
      return <span class='i-mdi-loading inline-block animate-spin text-current' />
    }
    if (props.icon) return props.icon
    return null
  })

  const content = (
    <>
      <Show when={iconNode() && _iconPlacement() === 'start'}>
        <span class="inline-flex items-center text-current">{iconNode()}</span>
      </Show>
      <Show when={_isAnchor()}>
        <a ref={anchor} href={props.href} target={props.target || '_self'} rel={props.rel} class="text-current no-underline">
          {props.children}
        </a>
      </Show>
      <Show when={!_isAnchor() && props.children}>
        <span>{props.children}</span>
      </Show>
      <Show when={iconNode() && _iconPlacement() === 'end'}>
        <span class="inline-flex items-center text-current">{iconNode()}</span>
      </Show>
    </>
  )

  return (
    <button ref={button} class={buttonClass(_styleChoice())} disabled={!!disabled}>
      {content}
      <Show when={_needsWave() && waveActive()}>
        <span class={waveClass({ active: true })} style={{ color: 'inherit' }} />
      </Show>
    </button>
  )
};

export default Button
