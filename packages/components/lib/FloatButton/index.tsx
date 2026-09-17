import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { Component, Show, createMemo, merge } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  createFloatButton,
  createTooltip,
  type FloatButtonIns,
} from 'upthrust-competence'
import { floatButtonClass, backTopIconClass } from './styles'
import { tooltipOverlayClass } from '../Tooltip/styles'

export interface FloatButtonProps {
  /** Icon node (antd `icon`). */
  icon?: JSX.Element
  /** BackTop mode: up glyph + click scrolls to top. */
  backTop?: boolean
  /** Controlled visibility. */
  visible?: boolean
  /** Show after this many scrolled px (BackTop default 400). */
  visibilityHeight?: number
  /** Scroll target when BackTop (defaults to window). */
  target?: () => HTMLElement | Window | undefined
  /** Click handler. */
  onClick?: (e?: Event) => void
  /** Tooltip on hover (antd renders a Tooltip around the button). */
  tooltip?: JSX.Element
  shape?: 'circle' | 'square'
  size?: 'middle' | 'large'
  /** Corner anchor. Default 'rt'. */
  placement?: 'rt' | 'rb' | 'lt' | 'lb'
  disabled?: boolean
  class?: string
  style?: JSX.CSSProperties
  ref?: (machine: FloatButtonIns) => void
}

const placementStyle = (p: 'rt' | 'rb' | 'lt' | 'lb'): JSX.CSSProperties => ({
  position: 'fixed',
  'z-index': '900',
  ...(p.startsWith('r') ? { right: '24px' } : { left: '24px' }),
  ...(p.endsWith('t') ? { bottom: '40px' } : { bottom: '24px' }),
})

/**
 * FloatButton — the fixed-corner action button (antd FloatButton).
 *
 * COMPOSITION: createFloatButton owns scroll visibility (threshold-gated
 * appear/hide, DI-able container) and the BackTop scroll-to-top intent.
 * Rendering is a portal to body so the button escapes any transformed
 * ancestor (position:fixed inside a transform is relative to it).
 */
const FloatButton: Component<FloatButtonProps> = (rawProps) => {
  const props = merge(
    { shape: 'circle' as const, size: 'middle' as const, placement: 'rt' as const },
    rawProps,
  )

  const isBackTop = () => !!props.backTop
  const threshold = () =>
    props.visibilityHeight ?? (isBackTop() ? 400 : undefined)

  const machine = createFloatButton({
    get visible() { return props.visible },
    get visibilityHeight() { return threshold() },
    get backTop() { return isBackTop() },
    get getScrollContainer() { return props.target },
    get onClick() { return props.onClick },
  })
  const m = () => machine
  props.ref?.(machine)

  // Tooltip wrapper (hover, antd parity) — only when a title was passed.
  const tooltip = createTooltip({
    get disabled() { return props.tooltip === undefined },
    placement: 'left',
  })

  const shown = () => m().visible()

  const button = (
    <button
      type="button"
      ref={tooltip.triggerRef}
      class={floatButtonClass({
        shape: props.shape,
        size: props.size,
        hidden: !shown(),
        disabled: !!props.disabled,
      })}
      style={placementStyle(props.placement)}
      aria-label={isBackTop() ? '回到顶部' : undefined}
      disabled={props.disabled}
      onClick={(e) => m().handleClick(e)}
    >
      <Show when={!isBackTop()} fallback={<span class={backTopIconClass()} />}>
        {props.icon}
      </Show>
    </button>
  )

  return (
    <Portal>
      <Show
        when={props.tooltip !== undefined}
        fallback={button}
      >
        {button}
        <Portal>
          <Show when={tooltip.mounted()}>
            <div
              ref={(el) => { tooltip.layerRef(el); tooltip.bindLayerHover() }}
              class={twMerge(
                tooltipOverlayClass({ visible: tooltip.open(), placement: 'left' }),
              )}
              style={{ ...tooltip.layerStyle() }}
              role="tooltip"
            >
              {props.tooltip}
            </div>
          </Show>
        </Portal>
      </Show>
    </Portal>
  )
}

// antd-style compound access: <FloatButton.BackTop> / <FloatButton.Group>.
// Named exports remain the tree-shakeable entries.
import BackTop from './BackTop'
import FloatButtonGroup from './Group'
export { BackTop, FloatButtonGroup as Group }
export type { BackTopProps } from './BackTop'
export type { FloatButtonGroupProps } from './Group'

const FloatButtonCompound = Object.assign(FloatButton, { BackTop, Group: FloatButtonGroup })
export default FloatButtonCompound
