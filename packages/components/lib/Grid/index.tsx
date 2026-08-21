import { Component,  createMemo, merge, createContext, useContext } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { rowClass, colClass } from './styles'
import { twMerge } from 'tailwind-merge'

interface RowContextType {
  gutter: () => [number, number]
}

const RowContext = createContext<RowContextType>({ gutter: () => [0, 0] as [number, number] })

export interface RowProps {
  gutter?: number | [number, number]
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
  align?: 'top' | 'middle' | 'bottom' | 'stretch'
  wrap?: boolean
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface ColProps {
  span?: number
  offset?: number
  push?: number
  pull?: number
  order?: number
  flex?: string | number
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export const Row: Component<RowProps> = (rawProps) => {
  const props = merge(
    { gutter: 0 as number | [number, number], justify: 'start' as const, align: 'top' as const, wrap: true },
    rawProps
  )

  const gutter = createMemo((): [number, number] => {
    if (Array.isArray(props.gutter)) return props.gutter
    return [props.gutter, 0]
  })

  const _class = createMemo(() =>
    twMerge(
      rowClass({ justify: props.justify, align: props.align, wrap: !!props.wrap }),
      props.class || ''
    )
  )

  const _style = createMemo((): JSX.CSSProperties => {
    const [h, v] = gutter()
    const s: JSX.CSSProperties = { ...props.style }
    if (h > 0) {
      s['margin-left'] = `${-h / 2}px`
      s['margin-right'] = `${-h / 2}px`
    }
    if (v > 0) {
      s['row-gap'] = `${v}px`
    }
    return s
  })

  return (
    <RowContext value={{ gutter }}>
      <div class={_class()} style={_style()}>
        {props.children}
      </div>
    </RowContext>
  )
}

export const Col: Component<ColProps> = (rawProps) => {
  const props = merge({ span: 24, offset: 0, push: 0, pull: 0 }, rawProps)
  const { gutter } = useContext(RowContext)

  const _class = createMemo(() => {
    const classes: string[] = [colClass({})]
    if (props.span === 0) {
      classes.push('hidden')
    }
    return twMerge(...classes, props.class || '')
  })

  const _style = createMemo((): JSX.CSSProperties => {
    const s: JSX.CSSProperties = { ...props.style }
    const [h] = gutter()

    if (h > 0) {
      s['padding-left'] = `${h / 2}px`
      s['padding-right'] = `${h / 2}px`
    }

    if (props.span !== undefined && props.span > 0) {
      const pct = `${(props.span / 24) * 100}%`
      s.flex = `0 0 ${pct}`
      s['max-width'] = pct
    }

    if (props.offset && props.offset > 0) {
      s['margin-left'] = `${(props.offset / 24) * 100}%`
    }

    if (props.push && props.push > 0) {
      s.left = `${(props.push / 24) * 100}%`
    }

    if (props.pull && props.pull > 0) {
      s.right = `${(props.pull / 24) * 100}%`
    }

    if (props.order !== undefined) {
      s.order = String(props.order)
    }

    if (props.flex !== undefined) {
      if (typeof props.flex === 'number') {
        s.flex = `${props.flex} ${props.flex} auto`
      } else {
        s.flex = props.flex
      }
    }

    return s
  })

  return (
    <div class={_class()} style={_style()}>
      {props.children}
    </div>
  )
}

const Grid = { Row, Col }
export default Grid
