import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import FloatButton, { BackTop, Group } from '../../../components/lib/FloatButton'
import { mount } from '../../utils/mount'

const props: Public.FloatButtonProps = {
  type: 'primary' satisfies Public.FloatButtonType,
  shape: 'square' satisfies Public.FloatButtonShape,
  content: '帮助',
  badge: { count: 5 } satisfies Public.FloatButtonBadgeProps,
  tooltip: { title: '提示', placement: 'left' } satisfies Public.FloatButtonTooltipProps,
  classNames: { icon: 'i' } satisfies Public.FloatButtonSemanticClassNames,
  styles: (info: Public.FloatButtonSemanticInfo) => ({ content: { color: info.props.type === 'primary' ? 'white' : 'black' } }) satisfies Public.FloatButtonSemanticStyles,
}
const group: Omit<Public.FloatButtonGroupProps, 'children'> = {
  trigger: 'click' satisfies Public.FloatButtonGroupTrigger,
  placement: 'left' satisfies Public.FloatButtonGroupPlacement,
  classNames: { list: 'l' } satisfies Public.FloatButtonGroupSemanticClassNames,
  styles: (info: Public.FloatButtonGroupSemanticInfo) => ({ root: { opacity: info.props.shape === 'circle' ? '1' : '0.9' } }) satisfies Public.FloatButtonGroupSemanticStyles,
}
const back: Public.BackTopProps = { visibilityHeight: 0, duration: 300 }
// barrel 的 uno.css 副作用只能在构建环境解析，这里用类型断言确认公开组件签名与目录实现一致。
const PublicFloatButton: typeof Public.FloatButton = FloatButton
const PublicBackTop: typeof Public.BackTop = BackTop
const PublicGroup: typeof Public.FloatButtonGroup = Group

// 公开入口：FloatButton / BackTop / FloatButtonGroup 与复合访问、语义化与徽标类型可用；最小挂载后可清理。
it('[float-button.exports] mounts FloatButton, BackTop and Group from the public entry', () => {
  expect(PublicFloatButton.BackTop).toBe(PublicBackTop)
  expect(PublicFloatButton.Group).toBe(PublicGroup)
  const view = mount(() => <>
    <PublicFloatButton {...props} />
    <PublicBackTop {...back} />
    <PublicGroup {...group}><PublicFloatButton /></PublicGroup>
  </>)
  try {
    expect(view.host.querySelectorAll('[data-float-button-part="root"]')).toHaveLength(3)
    expect(view.host.querySelector('[data-float-button-part="icon"].i')).toBeNull()
    expect(view.host.querySelector('[data-float-button-part="group"]')).not.toBeNull()
  } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
