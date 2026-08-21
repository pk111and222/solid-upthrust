import { Component,  For, createMemo, merge, children as resolveChildren } from 'solid-js'
import type { JSX } from '@solidjs/web'
import type { SizeType } from '../../common/type'
import { spaceClass, compactClass, SPACE_GAP_CLASS, SPACE_COL_GAP_CLASS, SPACE_ROW_GAP_CLASS } from './styles'
import { twMerge } from 'tailwind-merge'

type SpaceSize = SizeType | number

export interface SpaceProps {
  direction?: 'horizontal' | 'vertical'
  size?: SpaceSize | [SpaceSize, SpaceSize]
  align?: 'start' | 'center' | 'end' | 'baseline'
  wrap?: boolean
  split?: JSX.Element
  block?: boolean
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface CompactProps {
  direction?: 'horizontal' | 'vertical'
  block?: boolean
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

function resolveGapStyle(size: SpaceSize): string | undefined {
  if (typeof size === 'number') return `${size}px`
  return undefined
}

const SpaceBase: Component<SpaceProps> = (rawProps) => {
  const props = merge(
    { direction: 'horizontal' as const, size: 'small' as SpaceSize, wrap: false, block: false },
    rawProps
  )

  const resolved = resolveChildren(() => rawProps.children)

  const items = createMemo(() => {
    const c = resolved()
    if (Array.isArray(c)) return c.filter((item) => item != null && item !== false && item !== true && item !== '')
    if (c != null && c !== false && c !== true && c !== '') return [c]
    return []
  })

  const _class = createMemo(() => {
    const base = spaceClass({
      direction: props.direction,
      wrap: !!props.wrap,
      align: props.align,
      block: !!props.block,
    })

    const gapCls: string[] = []
    if (Array.isArray(props.size)) {
      const [colSize, rowSize] = props.size
      if (typeof colSize === 'string' && SPACE_COL_GAP_CLASS[colSize]) gapCls.push(SPACE_COL_GAP_CLASS[colSize])
      if (typeof rowSize === 'string' && SPACE_ROW_GAP_CLASS[rowSize]) gapCls.push(SPACE_ROW_GAP_CLASS[rowSize])
    } else if (typeof props.size === 'string' && SPACE_GAP_CLASS[props.size]) {
      gapCls.push(SPACE_GAP_CLASS[props.size])
    }

    return twMerge(base, ...gapCls, props.class || '')
  })

  const _style = createMemo((): JSX.CSSProperties => {
    const s: JSX.CSSProperties = { ...props.style }
    if (Array.isArray(props.size)) {
      const [colSize, rowSize] = props.size
      const colGap = resolveGapStyle(colSize)
      const rowGap = resolveGapStyle(rowSize)
      if (colGap) s['column-gap'] = colGap
      if (rowGap) s['row-gap'] = rowGap
    } else {
      const gap = resolveGapStyle(props.size)
      if (gap) s.gap = gap
    }
    return s
  })

  return (
    <div class={_class()} style={_style()}>
      <For each={items()}>
        {(child, index) => (
          <>
            {index() > 0 && props.split ? <span class="flex-none">{props.split}</span> : null}
            <div class="space-item">{child}</div>
          </>
        )}
      </For>
    </div>
  )
}

export const Compact: Component<CompactProps> = (rawProps) => {
  const props = merge({ direction: 'horizontal' as const, block: false }, rawProps)

  const _class = createMemo(() =>
    twMerge(compactClass({ direction: props.direction, block: !!props.block }), props.class || '')
  )

  return (
    <div class={_class()} style={props.style}>
      {props.children}
    </div>
  )
}

const Space = Object.assign(SpaceBase, { Compact })
export default Space
