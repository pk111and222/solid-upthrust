import { Component,  For, createMemo, merge, children as resolveChildren } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createMasonry, type MasonryColumns } from 'upthrust-competence'
import type { SizeType } from '../../common/type'
import { masonryClass, masonryColumnClass } from './styles'
import { twMerge } from 'tailwind-merge'

type MasonryGutter = SizeType | number | [number, number]

export interface MasonryProps {
  /** Fixed column count, or named breakpoints mapping to a column count. */
  columns?: MasonryColumns
  gutter?: MasonryGutter
  sequential?: boolean
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

const NAMED_GUTTERS: readonly string[] = ['small', 'middle', 'large']

function isNamedGutter(g: MasonryGutter): g is SizeType {
  return typeof g === 'string' && (NAMED_GUTTERS as readonly string[]).includes(g)
}

const Masonry: Component<MasonryProps> = (rawProps) => {
  const props = merge({ columns: 4, gutter: 'small' as MasonryGutter, sequential: false }, rawProps)

  const resolved = resolveChildren(() => rawProps.children)

  const items = createMemo(() => {
    const c = resolved()
    if (Array.isArray(c)) return c.filter(Boolean)
    return c ? [c] : []
  })

  const masonry = createMasonry<JSX.Element>({
    get columns() { return props.columns },
    get sequential() { return props.sequential },
  })

  const columns = createMemo(() => masonry.distribute(items()))

  const gutterVariant = createMemo(() => {
    return isNamedGutter(props.gutter) ? props.gutter : undefined
  })

  const _class = createMemo(() =>
    twMerge(masonryClass({ gutter: gutterVariant() }), props.class || '')
  )

  const _style = createMemo((): JSX.CSSProperties => {
    const s: JSX.CSSProperties = { ...props.style }
    if (!isNamedGutter(props.gutter)) {
      if (Array.isArray(props.gutter)) {
        s['column-gap'] = `${props.gutter[0]}px`
      } else {
        s.gap = `${props.gutter}px`
      }
    }
    return s
  })

  const _colStyle = createMemo((): JSX.CSSProperties => {
    if (!isNamedGutter(props.gutter)) {
      if (Array.isArray(props.gutter)) {
        return { 'row-gap': `${props.gutter[1]}px` }
      }
      return { gap: `${props.gutter}px` }
    }
    return {}
  })

  const _colClass = createMemo(() => masonryColumnClass({ gutter: gutterVariant() }))

  return (
    <div class={_class()} style={_style()}>
      <For each={columns()}>
        {(col) => (
          <div class={_colClass()} style={_colStyle()}>
            <For each={col}>
              {(item) => <>{item}</>}
            </For>
          </div>
        )}
      </For>
    </div>
  )
}

export default Masonry
