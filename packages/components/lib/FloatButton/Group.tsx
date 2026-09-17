import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { Component, For, Show, createMemo, merge } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import { createFloatButtonGroup, type FloatButtonDirection } from 'upthrust-competence'
import { floatButtonClass, floatGroupClass, floatGroupItemsClass, floatGroupItemClass, floatTriggerIconClass, backTopIconClass } from './styles'

export interface FloatButtonGroupProps {
  /** Which way the fan opens from the trigger. Default 'up'. */
  direction?: FloatButtonDirection
  /** Trigger icon. */
  icon?: JSX.Element
  /** Start expanded. */
  defaultOpen?: boolean
  /** Controlled expansion. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Corner anchor. Default 'rt'. */
  placement?: 'rt' | 'rb' | 'lt' | 'lb'
  shape?: 'circle' | 'square'
  size?: 'middle' | 'large'
  /** Tooltip on the trigger. */
  tooltip?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
  children: JSX.Element
}

/**
 * FloatButton.Group — the collapsed stack that fans its children out along
 * `direction`. The trigger is the visual base of the stack (renders LAST in
 * the flex column so it sits at the bottom when fanning up); children ride
 * the fan with a per-child stagger (inline transition-delay).
 */
const FloatButtonGroup: Component<FloatButtonGroupProps> = (rawProps) => {
  const props = merge(
    { direction: 'up' as FloatButtonDirection, shape: 'circle' as const, size: 'middle' as const, placement: 'rt' as const },
    rawProps,
  )

  const machine = createFloatButtonGroup({
    get direction() { return props.direction },
    get defaultOpen() { return props.defaultOpen },
    get open() { return props.open },
    get onOpenChange() { return props.onOpenChange },
  })
  const m = () => machine

  const open = () => m().open()

  return (
    <Portal>
      <div class={twMerge(floatGroupClass({ direction: props.direction, placement: props.placement }), props.class)} style={props.style}>
        {/* The fan: children stack along `direction`, staggered entry. */}
        <div class={floatGroupItemsClass(props.direction)}>
          <For each={[...(Array.isArray(props.children) ? props.children : [props.children])]}>
            {(child, i) => (
              <Show when={open()}>
                <div
                  class={floatGroupItemClass()}
                  style={{ 'transition-delay': `${i() * 40}ms` }}
                >
                  {child}
                </div>
              </Show>
            )}
          </For>
        </div>
        {/* The trigger — the stack's visual base. */}
        <button
          type="button"
          class={floatButtonClass({
            shape: props.shape,
            size: props.size,
            hidden: false,
          })}
          aria-expanded={open() ? 'true' : 'false'}
          onClick={() => m().toggle()}
        >
          <Show when={props.icon} fallback={<span class={floatTriggerIconClass(open())} />}>
            {props.icon}
          </Show>
        </button>
      </div>
    </Portal>
  )
}

export default FloatButtonGroup
