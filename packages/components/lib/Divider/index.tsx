import { Component,  Show, createMemo, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { dividerClass, dividerTextClass, dividerLineClass } from './styles'

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
  const props = merge(
    { type: 'horizontal' as const, dashed: false, orientation: 'center' as const, plain: false },
    rawProps
  )

  const hasChildren = createMemo(() => props.children !== undefined && props.children !== null)
  const isHorizontal = createMemo(() => props.type === 'horizontal')

  const _class = createMemo(() =>
    `${dividerClass({ type: props.type, dashed: !!props.dashed, hasText: isHorizontal() && hasChildren() })} ${props.class || ''}`.trim()
  )

  const _lineClass = createMemo(() => dividerLineClass({ dashed: !!props.dashed }))

  const leftStyle = createMemo((): JSX.CSSProperties => {
    if (props.orientationMargin !== undefined && props.orientation === 'left') {
      const w = typeof props.orientationMargin === 'number' ? `${props.orientationMargin}px` : props.orientationMargin
      return { flex: 'none', width: w }
    }
    if (props.orientation === 'left') return { flex: '0 0 5%' }
    return { flex: '1' }
  })

  const rightStyle = createMemo((): JSX.CSSProperties => {
    if (props.orientationMargin !== undefined && props.orientation === 'right') {
      const w = typeof props.orientationMargin === 'number' ? `${props.orientationMargin}px` : props.orientationMargin
      return { flex: 'none', width: w }
    }
    if (props.orientation === 'right') return { flex: '0 0 5%' }
    return { flex: '1' }
  })

  return (
    <Show
      when={isHorizontal() && hasChildren()}
      fallback={<div class={_class()} style={props.style} role="separator" />}
    >
      <div class={_class()} style={props.style} role="separator">
        <span class={_lineClass()} style={leftStyle()} />
        <span class={dividerTextClass({ plain: !!props.plain })}>
          {props.children}
        </span>
        <span class={_lineClass()} style={rightStyle()} />
      </div>
    </Show>
  )
}

export default Divider
