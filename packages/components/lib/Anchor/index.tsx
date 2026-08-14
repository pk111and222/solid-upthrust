import { Component, JSX, For, mergeProps, createMemo } from 'solid-js'
import { createAnchor, type AnchorItem } from 'upthrust-competence'
import { anchorContainerClass, anchorLinkClass } from './styles'
import { twMerge } from 'tailwind-merge'

export interface AnchorProps {
  items: AnchorItem[]
  direction?: 'vertical' | 'horizontal'
  targetOffset?: number
  onChange?: (activeKey: string) => void
  getCurrentAnchor?: () => string
  bounds?: number
  class?: string
  style?: JSX.CSSProperties
}

export interface AnchorLinkProps {
  item: AnchorItem
  direction: 'vertical' | 'horizontal'
  activeKey: () => string
  onLinkClick: (key: string) => void
  level?: number
}

const AnchorLink: Component<AnchorLinkProps> = (props) => {
  return (
    <>
      <a
        class={anchorLinkClass({ active: props.activeKey() === props.item.key, direction: props.direction })}
        style={props.level && props.direction === 'vertical' ? { 'padding-left': `${(props.level + 1) * 16}px` } : undefined}
        href={props.item.href}
        onClick={(e) => {
          e.preventDefault()
          props.onLinkClick(props.item.key)
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
          />
        )}
      </For>
    </>
  )
}

const Anchor: Component<AnchorProps> = (rawProps) => {
  const props = mergeProps(
    { direction: 'vertical' as const, targetOffset: 0, bounds: 5 },
    rawProps
  )

  const anchor = createAnchor({
    get items() { return props.items },
    get targetOffset() { return props.targetOffset },
    get onChange() { return props.onChange },
    get getCurrentAnchor() { return props.getCurrentAnchor },
    get bounds() { return props.bounds },
  })

  return (
    <div class={twMerge(anchorContainerClass({ direction: props.direction }), props.class)} style={props.style}>
      <For each={props.items}>
        {(item) => (
          <AnchorLink
            item={item}
            direction={props.direction}
            activeKey={anchor.activeKey}
            onLinkClick={(key) => anchor.scrollTo(key)}
          />
        )}
      </For>
    </div>
  )
}

export default Anchor
