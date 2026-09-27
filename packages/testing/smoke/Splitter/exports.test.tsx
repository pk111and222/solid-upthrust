import { afterEach, expect, it } from 'vitest'
import Splitter, {
  Panel,
  type SplitterClassNames, type SplitterCollapseType, type SplitterCollapsibleConfig, type SplitterCollapsibleIconMode,
  type SplitterOrientation, type SplitterPanelCollapsible, type SplitterPanelProps, type SplitterProps, type SplitterSize,
  type SplitterStyles,
} from '../../../components/lib/Splitter'
import type * as Public from '../../../components/lib'
import * as Competence from '../../../competence/src'
import { mount } from '../../utils/mount'

// 公开类型可从 barrel 取到，且与组件目录导出的类型一致（编译期校验）。
const orientation: Public.SplitterOrientation = 'vertical' satisfies SplitterOrientation
const size: Public.SplitterSize = '30%' satisfies SplitterSize
const collapseType: Public.SplitterCollapseType = 'end' satisfies SplitterCollapseType
const iconMode: Public.SplitterCollapsibleIconMode = 'auto' satisfies SplitterCollapsibleIconMode
const panelCollapsible: Public.SplitterPanelCollapsible = { start: true, showCollapsibleIcon: iconMode } satisfies SplitterPanelCollapsible
const collapsible: Public.SplitterCollapsibleConfig = { motion: true } satisfies SplitterCollapsibleConfig
const classNames: Public.SplitterClassNames = { root: 'r', dragger: { default: 'd', active: 'a' } } satisfies SplitterClassNames
const styles: Public.SplitterStyles = { panel: { padding: '8px' } } satisfies SplitterStyles
const panelProps: Public.SplitterPanelProps = { defaultSize: size, min: 50, collapsible: panelCollapsible } satisfies SplitterPanelProps
const splitterProps: Public.SplitterProps = {
  orientation, collapsible, classNames, styles, id: 'root',
  onCollapse: (collapsed: boolean[], sizes: number[]) => void [collapsed, sizes],
} satisfies SplitterProps
void collapseType

let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })

// 默认导出挂载了 Panel，且与具名导出、barrel 导出是同一实现。
it('[splitter.exports.shape] Splitter.Panel matches the named and barrel exports', () => {
  const PublicSplitter: typeof Public.Splitter = Splitter
  expect(PublicSplitter.Panel).toBe(Panel)
})

// competence 入口导出 Splitter 状态机与纯函数，供自定义分隔面板复用。
it('[splitter.exports.competence] competence exposes the splitter primitives', () => {
  expect(typeof Competence.createSplitter).toBe('function')
  expect(Competence.resolveSplitterSize('25%', 400)).toBe(100)
  expect(Competence.autoSplitterSizes([undefined, undefined], [], [], 200)).toEqual([100, 100])
  expect(Competence.normalizeCollapsible(true).start).toBe(true)
  expect(Competence.resolveSplitterOrientation(undefined, true)).toBe('vertical')
})

// 公开组件真实挂载：两个面板 + 一个分隔条；卸载后宿主无残留。
it('[splitter.exports.mount] public components mount and clean up', () => {
  const view = mount(() => (
    <Splitter {...splitterProps}>
      <Panel {...panelProps}>A</Panel>
      <Panel>B</Panel>
    </Splitter>
  ))
  dispose = view.dispose
  const root = view.host.firstElementChild as HTMLElement
  expect(root.id).toBe('root')
  expect(root.querySelectorAll('[role="separator"]')).toHaveLength(1)
  expect(root.textContent).toContain('A')
  expect(root.textContent).toContain('B')
  view.dispose(); dispose = () => {}
  expect(view.host.isConnected).toBe(false)
  expect(view.host.childNodes).toHaveLength(0)
})
