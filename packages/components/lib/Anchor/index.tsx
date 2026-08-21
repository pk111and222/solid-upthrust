import { Component, For, createMemo, createSignal, merge } from 'solid-js'
import { createOwnerCleanup } from 'upthrust-competence'
import type { JSX } from '@solidjs/web'
import { createAnchor, type AnchorItem } from 'upthrust-competence'
import { anchorContainerClass, anchorLinkClass, anchorInkClass } from './styles'
import { twMerge } from 'tailwind-merge'

export interface AnchorProps {
  items: AnchorItem[]
  direction?: 'vertical' | 'horizontal'
  targetOffset?: number
  onChange?: (activeKey: string) => void
  getCurrentAnchor?: () => string
  bounds?: number
  /** Scroll container for scroll-spy; defaults to window. */
  getScrollContainer?: () => HTMLElement | Window | undefined
  class?: string
  style?: JSX.CSSProperties
}

export interface AnchorLinkProps {
  item: AnchorItem
  direction: 'vertical' | 'horizontal'
  activeKey: () => string
  onLinkClick: (key: string, e: MouseEvent) => void
  level?: number
  registerRef?: (key: string, el: HTMLAnchorElement) => void
  unregisterRef?: (key: string) => void
}

const AnchorLink: Component<AnchorLinkProps> = (props) => {
  // Solid 2 runs ref callbacks under a null owner — plain onCleanup there
  // warns [NO_OWNER_CLEANUP] and never runs. Bind to the component owner.
  const onOwnerCleanup = createOwnerCleanup()
  const state = createMemo(() =>
    props.activeKey() === props.item.key
      ? (props.direction === 'vertical' ? 'active-vertical' : 'active-horizontal')
      : 'idle'
  )

  return (
    <>
      <a
        ref={(el) => {
          props.registerRef?.(props.item.key, el)
          onOwnerCleanup(() => props.unregisterRef?.(props.item.key))
        }}
        class={anchorLinkClass({ direction: props.direction, state: state() })}
        style={props.level && props.direction === 'vertical' ? { 'padding-left': `${(props.level + 1) * 16}px` } : undefined}
        href={props.item.href}
        onClick={(e) => {
          e.preventDefault()
          props.onLinkClick(props.item.key, e)
        }}
      >
        {props.item.title}
      </a>
      <For each={props.item.children}>
        {(child) => (
          <AnchorLink
            item={child}
            direction={props.direction}
            activeKey={props.activeKey}
            onLinkClick={props.onLinkClick}
            level={(props.level ?? 0) + 1}
            registerRef={props.registerRef}
            unregisterRef={props.unregisterRef}
          />
        )}
      </For>
    </>
  )
}

const Anchor: Component<AnchorProps> = (rawProps) => {
  const props = merge(
    { direction: 'vertical' as const, targetOffset: 0, bounds: 5 },
    rawProps
  )

  const anchor = createAnchor({
    get items() { return props.items },
    get targetOffset() { return props.targetOffset },
    get onChange() { return props.onChange },
    get getCurrentAnchor() { return props.getCurrentAnchor },
    get bounds() { return props.bounds },
    get getScrollContainer() { return props.getScrollContainer },
  })

  // Link element registry — drives the ink indicator position.
  const [linkEls, setLinkEls] = createSignal(new Map<string, HTMLAnchorElement>())
  const registerRef = (key: string, el: HTMLAnchorElement) => {
    setLinkEls((prev) => new Map(prev).set(key, el))
  }
  const unregisterRef = (key: string) => {
    setLinkEls((prev) => {
      if (!prev.has(key)) return prev
      const next = new Map(prev)
      next.delete(key)
      return next
    })
  }

  // Ink position follows the active link element.
  const inkStyle = createMemo(() => {
    const active = linkEls().get(anchor.activeKey())
    if (!active) return { opacity: 0 }
    if (props.direction === 'horizontal') {
      return { opacity: 1, left: `${active.offsetLeft}px`, width: `${active.offsetWidth}px` }
    }
    return { opacity: 1, top: `${active.offsetTop}px`, height: `${active.offsetHeight}px` }
  })

  // (no manual cleanup needed — link registry cleans up per-link in ref
  // callbacks via createOwnerCleanup in the competence layer)

  return (
    <div class={twMerge(anchorContainerClass({ direction: props.direction }), props.class)} style={props.style}>
      <For each={props.items}>
        {(item) => (
          <AnchorLink
            item={item}
            direction={props.direction}
            activeKey={anchor.activeKey}
            onLinkClick={(key) => anchor.scrollTo(key)}
            registerRef={registerRef}
            unregisterRef={unregisterRef}
          />
        )}
      </For>
      <div class={anchorInkClass({ direction: props.direction })} style={inkStyle()} />
    </div>
  )
}

export default Anchor
