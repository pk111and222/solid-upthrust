import { Component, JSX, Show, createMemo, mergeProps } from 'solid-js'
import { dividerClass, dividerTextClass } from './styles'

export interface DividerProps {
  type?: 'horizontal' | 'vertical'
  dashed?: boolean
  orientation?: 'left' | 'center' | 'right'
  orientationMargin?: string | number
  plain?: boolean
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

const Divider: Component<DividerProps> = (rawProps) => {
  const props = mergeProps(
    { type: 'horizontal' as const, dashed: false, orientation: 'center' as const, plain: false },
    rawProps
  )

  const hasChildren = createMemo(() => props.children !== undefined && props.children !== null)
  const isHorizontal = createMemo(() => props.type === 'horizontal')

  const _class = createMemo(() => {
    const base = dividerClass({ type: props.type, dashed: props.dashed, plain: props.plain })
    if (isHorizontal() && hasChildren()) {
      return `${base} flex items-center border-t-0 my-6 ${props.class || ''}`.trim()
    }
    return `${base} ${props.class || ''}`.trim()
  })

  const lineClass = createMemo(() => {
    const base = 'flex-1 border-0 border-t border-solid border-outline/20'
    return props.dashed ? `${base} border-dashed` : base
  })

  const leftFlex = createMemo(() => {
    if (props.orientationMargin !== undefined) return undefined
    if (props.orientation === 'left') return '0 0 5%'
    if (props.orientation === 'right') return '1'
    return '1'
  })

  const rightFlex = createMemo(() => {
    if (props.orientationMargin !== undefined) return undefined
    if (props.orientation === 'right') return '0 0 5%'
    if (props.orientation === 'left') return '1'
    return '1'
  })

  const leftWidth = createMemo(() => {
    if (props.orientationMargin === undefined) return undefined
    if (props.orientation === 'left') {
      return typeof props.orientationMargin === 'number'
        ? `${props.orientationMargin}px`
        : props.orientationMargin
    }
    return undefined
  })

  const rightWidth = createMemo(() => {
    if (props.orientationMargin === undefined) return undefined
    if (props.orientation === 'right') {
      return typeof props.orientationMargin === 'number'
        ? `${props.orientationMargin}px`
        : props.orientationMargin
    }
    return undefined
  })

  return (
    <Show
      when={isHorizontal() && hasChildren()}
      fallback={<div class={_class()} style={props.style} role="separator" />}
    >
      <div class={_class()} style={props.style} role="separator">
        <span
          class={lineClass()}
          style={{ flex: leftFlex(), width: leftWidth(), 'min-width': leftWidth() ? '0' : undefined }}
        />
        <span class={dividerTextClass({ orientation: props.orientation, plain: props.plain })} style={{ padding: '0 1em' }}>
          {props.children}
        </span>
        <span
          class={lineClass()}
          style={{ flex: rightFlex(), width: rightWidth(), 'min-width': rightWidth() ? '0' : undefined }}
        />
      </div>
    </Show>
  )
}

export default Divider
