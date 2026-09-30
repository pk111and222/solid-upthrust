import { Show, merge, omit, useContext } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { createFloatButton } from 'upthrust-competence'
import { mergeClass } from '../../common/merge'
import { VerticalAlignTopOutlined } from '../../common/antIcons'
import FloatButton, { type FloatButtonProps } from './FloatButton'
import { FloatButtonGroupContext } from './context'
import { createPresence } from './presence'
import { backTopFadeClass } from './styles'

export interface BackTopProps extends Omit<FloatButtonProps, 'target'> {
  /** 滚动高度达到此值才出现，默认 400；0 表示一开始就显示。 */
  visibilityHeight?: number
  /** 监听滚动的目标，默认 window。 */
  target?: () => HTMLElement | Window | Document
  /** 回到顶部的动画时长（ms），默认 450。 */
  duration?: number
  /** 可见性变化回调（本库扩展）。 */
  onVisibleChange?: (visible: boolean) => void
}

/** antd `-fade` 离场时长（motionDurationMid）。 */
const FADE_MS = 200

/**
 * FloatButton.BackTop — antd 6 BackTop：滚动高度 >= visibilityHeight 时淡入，
 * 点击以 easeInOutCubic 在 duration 内滚回顶部，再触发 onClick。默认图标 VerticalAlignTopOutlined。
 */
const BackTop = (rawProps: BackTopProps): JSX.Element => {
  const group = useContext(FloatButtonGroupContext)
  const props = merge({ visibilityHeight: 400, duration: 450 }, rawProps)
  const rest = omit(rawProps, 'visibilityHeight', 'target', 'duration', 'onVisibleChange', 'onClick', 'icon', 'class', 'shape')

  const machine = createFloatButton({
    backTop: true,
    get visibilityHeight() { return props.visibilityHeight },
    get getScrollContainer() { return props.target },
    get duration() { return props.duration },
    get onVisibleChange() { return props.onVisibleChange },
  })
  const presence = createPresence(machine.visible, FADE_MS)

  return (
    <Show when={presence.mounted()}>
      <FloatButton
        {...rest}
        shape={group?.shape ?? props.shape}
        icon={props.icon ?? <VerticalAlignTopOutlined />}
        data-float-button-backtop={presence.entered() ? 'visible' : 'hidden'}
        class={mergeClass(backTopFadeClass({ visible: presence.entered() }), props.class)}
        onClick={(e) => { machine.handleClick(e); props.onClick?.(e) }}
      />
    </Show>
  )
}

export default BackTop
