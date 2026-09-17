import { useComponentProps } from '../ConfigProvider/context'
import { Component, Show, createMemo, untrack } from 'solid-js'
import type { JSX } from '@solidjs/web'
import type { SizeType } from '../../common/type'
import { createButton, type ButtonIns, type ButtonVariant, type ButtonColor } from 'upthrust-competence'
import { buttonClass, waveClass, type ButtonStyleVariants } from './styles'

export type ButtonType = 'primary' | 'link' | 'text' | 'default' | 'dashed'
export type ButtonShape = 'default' | 'circle' | 'round'
type ColorScheme = `${ButtonVariant}-${ButtonColor}`

export type { ButtonIns, ButtonVariant, ButtonColor } from 'upthrust-competence'
export interface ButtonProps extends Omit<JSX.ButtonHTMLAttributes<HTMLElement>, 'type' | 'color' | 'onClick' | 'ref' | 'children'> {
  htmlType?: 'button' | 'submit' | 'reset'

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

const Button: Component<ButtonProps> = (providedProps = {}) => {
  const props = useComponentProps('Button', providedProps)
  const {loading, waveActive, button, anchor, refs} = createButton(props)
  const disabled = () => !!props.disabled

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
    disabled: disabled(),
    ghost: props.ghost || false,
    block: props.block || false,
    loading: loading(),
  }))

  const _needsWave = createMemo(() => {
    const v = resolvedVariant()
    return v !== 'link' && v !== 'text'
  })

  untrack(() => props.ref?.(refs))
  const excluded = new Set<string>([
    'variant', 'color', 'type', 'htmlType', 'block', 'danger', 'disabled', 'ghost',
    'href', 'icon', 'iconPlacement', 'loading', 'shape', 'size', 'target', 'rel',
    'onClick', 'children', 'ref', 'class',
  ])
  // Materialize only native keys: passing the merged proxy through a spread can
  // expose omitted event properties and register onClick twice in Solid 2 RC.
  const native = createMemo(() => Object.fromEntries(Object.entries(props).filter(([key]) => !excluded.has(key))))

  const iconNode = createMemo(() => {
    if (_showLoading()) {
      return <span class='i-mdi-loading inline-block animate-spin text-current' />
    }
    if (props.icon) return props.icon
    return null
  })

  const content = () => (
    <>
      <Show when={iconNode() && _iconPlacement() === 'start'}>
        <span aria-hidden="true" class="inline-flex items-center text-current">{iconNode()}</span>
      </Show>
      <Show when={props.children !== undefined && props.children !== null}>
        <span>{typeof props.children === 'number' ? String(props.children) : props.children}</span>
      </Show>
      <Show when={iconNode() && _iconPlacement() === 'end'}>
        <span aria-hidden="true" class="inline-flex items-center text-current">{iconNode()}</span>
      </Show>
    </>
  )

  const contents = () => <>{content()}<Show when={_needsWave() && waveActive()}>
    <span aria-hidden="true" class={waveClass({active: true})} />
  </Show></>
  const classes = () => `${buttonClass(_styleChoice())} ${props.class ?? ''}`
  return <Show when={_isAnchor()} fallback={
    <button {...native()} ref={button} type={props.htmlType ?? 'button'} class={classes()}
      disabled={disabled()} aria-busy={loading() ? 'true' : undefined}>{contents()}</button>
  }>
    <a {...native()} ref={anchor} href={disabled() || loading() ? undefined : props.href}
      role="link" target={props.target} rel={props.rel}
      tabindex={disabled() ? -1 : props.tabindex} aria-disabled={disabled() || loading() ? 'true' : undefined}
      aria-busy={loading() ? 'true' : undefined} class={classes()}>{contents()}</a>
  </Show>
};

export default Button
