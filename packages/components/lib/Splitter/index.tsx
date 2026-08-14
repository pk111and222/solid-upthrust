import { Component, JSX, For, Show, createSignal, createMemo, mergeProps, onMount, children as resolveChildren } from 'solid-js'
import { splitterClass, splitterBarClass, splitterPanelClass } from './styles'
import { twMerge } from 'tailwind-merge'

export interface SplitterPanelProps {
  defaultSize?: number
  min?: number
  max?: number
  collapsible?: boolean
  resizable?: boolean
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export interface SplitterProps {
  layout?: 'horizontal' | 'vertical'
  onResize?: (sizes: number[]) => void
  onResizeEnd?: (sizes: number[]) => void
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export const Panel: Component<SplitterPanelProps> = (rawProps) => {
  const props = mergeProps({ resizable: true }, rawProps)
  return <>{props.children}</>
}

const Splitter: Component<SplitterProps> = (rawProps) => {
  const props = mergeProps({ layout: 'horizontal' as const }, rawProps)

  let containerRef: HTMLDivElement | undefined
  const [sizes, setSizes] = createSignal<number[]>([])
  const [dragging, setDragging] = createSignal<number | null>(null)

  const resolved = resolveChildren(() => rawProps.children)

  const panelChildren = createMemo(() => {
    const c = resolved()
    if (Array.isArray(c)) return c.filter(Boolean)
    return c ? [c] : []
  })

  const isHorizontal = createMemo(() => props.layout === 'horizontal')

  const _class = createMemo(() =>
    twMerge(splitterClass({ layout: props.layout }), props.class || '')
  )

  onMount(() => {
    const count = panelChildren().length
    if (count > 0 && sizes().length === 0) {
      setSizes(Array(count).fill(100 / count))
    }
  })

  const handleMouseDown = (index: number, e: MouseEvent) => {
    e.preventDefault()
    setDragging(index)

    const startPos = isHorizontal() ? e.clientX : e.clientY
    const startSizes = [...sizes()]
    const containerRect = containerRef!.getBoundingClientRect()
    const totalSize = isHorizontal() ? containerRect.width : containerRect.height

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = isHorizontal() ? moveEvent.clientX : moveEvent.clientY
      const diff = ((currentPos - startPos) / totalSize) * 100

      const newSizes = [...startSizes]
      const minSize = 5

      newSizes[index] = Math.max(minSize, startSizes[index] + diff)
      newSizes[index + 1] = Math.max(minSize, startSizes[index + 1] - diff)

      if (newSizes[index] >= minSize && newSizes[index + 1] >= minSize) {
        setSizes(newSizes)
        props.onResize?.(newSizes)
      }
    }

    const handleMouseUp = () => {
      setDragging(null)
      props.onResizeEnd?.(sizes())
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div ref={containerRef} class={_class()} style={props.style}>
      <For each={panelChildren()}>
        {(child, index) => (
          <>
            <div
              class={twMerge(splitterPanelClass({ layout: props.layout }))}
              style={{
                [isHorizontal() ? 'width' : 'height']: sizes()[index()] ? `${sizes()[index()]}%` : 'auto',
                'flex-shrink': '0',
              }}
            >
              {child}
            </div>
            <Show when={index() < panelChildren().length - 1}>
              <div
                class={splitterBarClass({ layout: props.layout, active: dragging() === index() })}
                onMouseDown={(e) => handleMouseDown(index(), e)}
              >
                <div class={`rounded-full bg-outline/30 ${isHorizontal() ? 'w-1 h-6' : 'w-6 h-1'}`} />
              </div>
            </Show>
          </>
        )}
      </For>
    </div>
  )
}

export default Object.assign(Splitter, { Panel })
