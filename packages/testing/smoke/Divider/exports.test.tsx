import { afterEach, expect, it } from 'vitest'
import Divider, {
  type DividerOrientation, type DividerProps, type DividerSemanticName, type DividerSize,
  type DividerTitlePlacement, type DividerVariant,
} from '../../../components/lib/Divider'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'

// 公开类型可从 barrel 取到，且与组件目录导出的类型一致（编译期校验）。
const orientation: Public.DividerOrientation = 'horizontal' satisfies DividerOrientation
const titlePlacement: Public.DividerTitlePlacement = 'start' satisfies DividerTitlePlacement
const variant: Public.DividerVariant = 'dotted' satisfies DividerVariant
const size: Public.DividerSize = 'small' satisfies DividerSize
const semantic: Public.DividerSemanticName = 'content' satisfies DividerSemanticName
const props: Public.DividerProps = { orientation, titlePlacement, variant, size, classNames: { [semantic]: 'x' } } satisfies DividerProps

let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })

// 公开组件真实挂载：带标题时渲染 rail + 标题 + rail，role 为 separator；卸载后宿主无残留。
it('[divider.exports.mount] public export mounts, renders the title and cleans up', () => {
  const PublicDivider: typeof Public.Divider = Divider
  const view = mount(() => <PublicDivider {...props}>Title</PublicDivider>)
  dispose = view.dispose
  const el = view.host.firstElementChild as HTMLElement
  expect(el.getAttribute('role')).toBe('separator')
  expect(el.children).toHaveLength(3)
  expect(el.children[1].className).toContain('x')
  expect(el.textContent).toBe('Title')
  view.dispose(); dispose = () => {}
  expect(view.host.isConnected).toBe(false)
  expect(view.host.childNodes).toHaveLength(0)
})
