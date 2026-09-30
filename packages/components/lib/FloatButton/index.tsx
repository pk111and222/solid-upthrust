import FloatButton from './FloatButton'
import BackTop from './BackTop'
import FloatButtonGroup from './Group'

export type {
  FloatButtonProps, FloatButtonBadgeProps, FloatButtonTooltipProps, FloatButtonSemanticInfo,
} from './FloatButton'
export type {
  FloatButtonType, FloatButtonShape, FloatButtonSemanticClassNames, FloatButtonSemanticStyles,
} from './context'
export type { BackTopProps } from './BackTop'
export type {
  FloatButtonGroupProps, FloatButtonGroupSemanticClassNames, FloatButtonGroupSemanticStyles, FloatButtonGroupSemanticInfo,
} from './Group'
export type { FloatButtonGroupPlacement, FloatButtonGroupTrigger } from 'upthrust-competence'

// antd 复合访问：<FloatButton.BackTop> / <FloatButton.Group>；具名导出保持可摇树。
export { BackTop, FloatButtonGroup as Group }

const FloatButtonCompound = Object.assign(FloatButton, { BackTop, Group: FloatButtonGroup })
export default FloatButtonCompound
