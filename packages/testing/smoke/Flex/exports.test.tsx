import { afterEach, expect, it } from 'vitest'
import Flex, { type FlexAlign, type FlexGap, type FlexJustify, type FlexOrientation, type FlexProps, type FlexWrap } from '../../../components/lib/Flex'
import type * as Public from '../../../components/lib'
import { mount } from '../../utils/mount'

// 公开类型可从 barrel 取到，且与组件目录导出的类型一致（编译期校验）。
const gap: Public.FlexGap = 'medium' satisfies FlexGap
const orientation: Public.FlexOrientation = 'vertical' satisfies FlexOrientation
const wrap: Public.FlexWrap = 'wrap-reverse' satisfies FlexWrap
const justify: Public.FlexJustify = 'space-between' satisfies FlexJustify
const align: Public.FlexAlign = 'baseline' satisfies FlexAlign
const props: Public.FlexProps = { gap, orientation, wrap, justify, align } satisfies FlexProps

let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })

// barrel 的 uno.css 副作用只能在构建环境解析，这里用类型断言确认公开组件签名与目录实现一致。
const PublicFlex: typeof Public.Flex = Flex

// 公开组件真实挂载后渲染子节点，卸载后宿主无残留。
it('[flex.exports.mount] public export mounts, renders children and cleans up', () => {
  const view = mount(() => <PublicFlex {...props}><span>A</span><span>B</span></PublicFlex>)
  dispose = view.dispose
  const el = view.host.firstElementChild as HTMLElement
  expect(el.tagName).toBe('DIV')
  expect(el.className).toContain('flex-col')
  expect(el.textContent).toBe('AB')
  view.dispose(); dispose = () => {}
  expect(view.host.isConnected).toBe(false)
  expect(view.host.childNodes).toHaveLength(0)
})
