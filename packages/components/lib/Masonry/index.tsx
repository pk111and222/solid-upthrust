import { Component, JSX, For, createMemo, createSignal, mergeProps, onMount, onCleanup, children as resolveChildren } from 'solid-js'
import { twMerge } from 'tailwind-merge'

export interface MasonryProps {
  columns?: number | Record<string, number>
  gutter?: number | [number, number]
  sequential?: boolean
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

const Masonry: Component<MasonryProps> = (rawProps) => {
  const props = mergeProps({ columns: 4, gutter: 8, sequential: false }, rawProps)

  const resolved = resolveChildren(() => rawProps.children)

  const items = createMemo(() => {
    const c = resolved()
    if (Array.isArray(c)) return c.filter(Boolean)
    return c ? [c] : []
  })

  const [columnCount, setColumnCount] = createSignal(
    typeof props.columns === 'number' ? props.columns : 4
  )

  const resolveGutter = createMemo((): [number, number] => {
    if (Array.isArray(props.gutter)) return props.gutter
    return [props.gutter, props.gutter]
  })

  const updateColumns = () => {
    if (typeof props.columns === 'number') {
      setColumnCount(props.columns)
      return
    }

    const breakpoints = props.columns as Record<string, number>
    const width = window.innerWidth
    const sorted = Object.entries(breakpoints)
      .map(([bp, cols]) => [parseInt(bp), cols] as [number, number])
      .sort((a, b) => b[0] - a[0])

    for (const [bp, cols] of sorted) {
      if (width >= bp) {
        setColumnCount(cols)
        return
      }
    }
    setColumnCount(sorted[sorted.length - 1]?.[1] || 4)
  }

  onMount(() => {
    if (typeof props.columns !== 'number') {
      updateColumns()
      window.addEventListener('resize', updateColumns)
    }
  })

  onCleanup(() => {
    if (typeof props.columns !== 'number') {
      window.removeEventListener('resize', updateColumns)
    }
  })

  const columns = createMemo(() => {
    const count = columnCount()
    const cols: JSX.Element[][] = Array.from({ length: count }, () => [])
    const allItems = items()

    if (props.sequential) {
      const perCol = Math.ceil(allItems.length / count)
      allItems.forEach((item, i) => {
        const colIdx = Math.floor(i / perCol)
        cols[Math.min(colIdx, count - 1)].push(item)
      })
    } else {
      allItems.forEach((item, i) => {
        cols[i % count].push(item)
      })
    }

    return cols
  })

  const _class = createMemo(() =>
    twMerge('flex', props.class || '')
  )

  const [hGap, vGap] = [
    createMemo(() => resolveGutter()[0]),
    createMemo(() => resolveGutter()[1]),
  ]

  return (
    <div class={_class()} style={{ gap: `${hGap()}px`, ...props.style }}>
      <For each={columns()}>
        {(col) => (
          <div class="flex-1 flex flex-col" style={{ gap: `${vGap()}px` }}>
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
