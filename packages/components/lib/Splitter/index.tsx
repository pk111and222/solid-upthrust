import { Component,  Show, createContext, createMemo, createSignal, merge, onCleanup, useContext } from 'solid-js'
import type { JSX } from '@solidjs/web'
import {
  createSplitter,
  createOwnerCleanup,
  type SplitterIns,
  type SplitterPanelHandle,
  type SplitterSize,
} from 'upthrust-competence'
import { splitterClass, splitterBarClass, splitterDraggerClass, splitterPanelClass } from './styles'
import { twMerge } from 'tailwind-merge'

export interface SplitterPanelProps {
  defaultSize?: SplitterSize
  min?: SplitterSize
  max?: SplitterSize
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

interface SplitterContextValue {
  api: SplitterIns
}

const SplitterContext = createContext<SplitterContextValue>()

/**
 * Panels register their config into the splitter through this context (Solid
 * resolves children before the parent can inspect them, so props can only
 * travel up via registration). Each panel renders itself plus the bar that
 * follows it.
 */
export const Panel: Component<SplitterPanelProps> = (rawProps) => {
  const ctx = useContext(SplitterContext)
  const props = merge({ resizable: true }, rawProps)

  let handle: SplitterPanelHandle | undefined
  if (ctx) {
    handle = ctx.api.register({
      get defaultSize() { return props.defaultSize },
      get min() { return props.min },
      get max() { return props.max },
      get resizable() { return !!props.resizable },
    })
    onCleanup(() => handle?.dispose())
  }

  const barIndex = createMemo(() => (handle ? handle.index() : -1))
  const isLast = createMemo(() =>
    !ctx || !handle ? true : barIndex() >= ctx.api.panels().length - 1
  )
  const disabled = createMemo(() => !ctx || !handle ? true : ctx.api.isBarDisabled(barIndex()))
  const isHorizontal = createMemo(() => (ctx ? ctx.api.isHorizontal() : true))
  const aria = createMemo(() =>
    ctx && handle ? ctx.api.aria(barIndex()) : { valueNow: 0, valueMin: 0, valueMax: 0 }
  )

  // Until the container is measured the normalized sizes are empty — fall back
  // to the raw defaultSize (px or %) so the first frame already looks right.
  const panelStyle = createMemo((): JSX.CSSProperties => {
    const base: JSX.CSSProperties = {}
    const sized = ctx && handle ? ctx.api.sizes()[barIndex()] : undefined
    if (sized != null) {
      base['flex-basis'] = `${sized}px`
    } else if (props.defaultSize !== undefined) {
      base['flex-basis'] = typeof props.defaultSize === 'number' ? `${props.defaultSize}px` : props.defaultSize
    }
    return { ...base, ...props.style }
  })

  const _panelClass = createMemo(() =>
    twMerge(splitterPanelClass({ layout: isHorizontal() ? 'horizontal' : 'vertical' }), props.class || '')
  )
  const [dragActive, setDragActive] = createSignal(false)
  const [barFocused, setBarFocused] = createSignal(false)
  const _barClass = createMemo(() =>
    splitterBarClass({ layout: isHorizontal() ? 'horizontal' : 'vertical', active: !!dragActive(), disabled: disabled() })
  )
  const _draggerClass = createMemo(() =>
    splitterDraggerClass({ layout: isHorizontal() ? 'horizontal' : 'vertical', active: !!dragActive(), focused: !!barFocused() })
  )

  let dragging = false
  let startPos = 0

  const onPointerDown = (e: PointerEvent) => {
    if (disabled() || !ctx) return
    e.preventDefault()
    // preventDefault suppresses the native focus transfer, so focus the bar
    // explicitly — otherwise keyboard resize is dead after a pointer press.
    ;(e.currentTarget as HTMLElement).focus()
    dragging = true
    setDragActive(true)
    startPos = ctx.api.isHorizontal() ? e.clientX : e.clientY
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging || !ctx) return
    const pos = ctx.api.isHorizontal() ? e.clientX : e.clientY
    ctx.api.resizeBy(barIndex(), pos - startPos)
    startPos = pos
  }

  const endDrag = (e: PointerEvent) => {
    if (!dragging || !ctx) return
    dragging = false
    setDragActive(false)
    ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
    ctx.api.endResize()
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (ctx && ctx.api.keyboardResize(barIndex(), e.key)) e.preventDefault()
  }

  return (
    <>
      <div class={_panelClass()} style={panelStyle()}>
        {props.children}
      </div>
      <Show when={!isLast()}>
        <div
          class={_barClass()}
          role="separator"
          tabindex={disabled() ? -1 : 0}
          aria-orientation={isHorizontal() ? 'vertical' : 'horizontal'}
          aria-disabled={disabled() ? 'true' : 'false'}
          aria-valuenow={aria().valueNow}
          aria-valuemin={aria().valueMin}
          aria-valuemax={aria().valueMax}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
          onFocus={() => setBarFocused(true)}
          onBlur={() => setBarFocused(false)}
        >
          <div class={_draggerClass()} />
        </div>
      </Show>
    </>
  )
}

const SplitterBase: Component<SplitterProps> = (rawProps) => {
  const props = merge({ layout: 'horizontal' as const }, rawProps)

  const api = createSplitter({
    get layout() { return props.layout },
    get onResize() { return props.onResize },
    get onResizeEnd() { return props.onResizeEnd },
  })

  const _class = createMemo(() =>
    twMerge(splitterClass({ layout: props.layout }), props.class || '')
  )

  // Ref callbacks run under a null owner in Solid 2 — bind the cleanup to the
  // owner captured at component creation.
  const onOwnerCleanup = createOwnerCleanup()
  let containerEl: HTMLDivElement | undefined
  const containerRef = (el: HTMLDivElement) => {
    containerEl = el
    const measure = () => {
      if (!containerEl) return
      const rect = containerEl.getBoundingClientRect()
      api.setContainerSize(api.isHorizontal() ? rect.width : rect.height)
    }
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure)
      observer.observe(el)
      onOwnerCleanup(() => observer.disconnect())
    } else {
      measure()
    }
  }

  return (
    <SplitterContext value={{ api }}>
      <div ref={containerRef} class={_class()} style={props.style}>
        {props.children}
      </div>
    </SplitterContext>
  )
}

const Splitter = Object.assign(SplitterBase, { Panel })
export default Splitter
