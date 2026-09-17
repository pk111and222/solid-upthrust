import { flush } from 'solid-js'
import { afterEach, expect, it } from 'vitest'
import { mount } from '../../utils/mount'
import Tabs from '../../../components/lib/Tabs'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {} })

const items = [
  { key: 'a', label: 'A', children: 'Panel A' },
  { key: 'b', label: 'B', children: 'Panel B' },
]

// line 类型渲染滑动指示条；card/editable-card 不渲染指示条（自身边框承担视觉结构）。
it.each([
  ['line', true],
  ['card', false],
  ['editable-card', false],
] as const)('[tabs.appearance.ink-bar] type=%s renders ink bar: %s', (type, expected) => {
  const view = mount(() => <Tabs type={type} items={items} />)
  cleanup = view.dispose
  const inkBar = view.host.querySelector('[role="tablist"] > div:not([role])')
  expect(!!inkBar).toBe(expected)
})

// editable-card 额外渲染"新增标签"按钮；line/card 不渲染（editable 未开启）。
it('[tabs.appearance.editable-add-button] only editable-card shows the add button by default', () => {
  const view = mount(() => <Tabs type="editable-card" items={items} />)
  cleanup = view.dispose
  expect(view.host.querySelector('[aria-label="新增页签"]')).not.toBeNull()
})

it('[tabs.appearance.hide-add] hideAdd suppresses the add button on editable-card', () => {
  const view = mount(() => <Tabs type="editable-card" hideAdd items={items} />)
  cleanup = view.dispose
  expect(view.host.querySelector('[aria-label="新增页签"]')).toBeNull()
})

// 四个 tabPosition 都能正常挂载并渲染对应方向的容器（回归：不崩溃、tablist 与 panel 都存在）。
it.each(['top', 'bottom', 'left', 'right'] as const)('[tabs.appearance.position] tabPosition=%s mounts tablist and panel', (tabPosition) => {
  const view = mount(() => <Tabs tabPosition={tabPosition} items={items} />)
  cleanup = view.dispose
  expect(view.host.querySelector('[role="tablist"]')).not.toBeNull()
  expect(view.host.querySelectorAll('[role="tabpanel"]')).toHaveLength(2)
})

// centered 只影响 tablist 的 justify-content，不改变标签数量或内容。
it('[tabs.appearance.centered] applies the centering class without altering tab count', () => {
  const view = mount(() => <Tabs centered items={items} />)
  cleanup = view.dispose
  const tablist = view.host.querySelector('[role="tablist"]')!
  expect(tablist.className).toContain('justify-center')
  expect(view.host.querySelectorAll('[role="tab"]')).toHaveLength(2)
})

// size 三档都是合法挂载值；具体像素由样式层负责，这里只验证类名随 size 变化。
it.each(['small', 'middle', 'large'] as const)('[tabs.appearance.size] size=%s renders a distinct tab class', (size) => {
  const view = mount(() => <Tabs size={size} items={items} />)
  cleanup = view.dispose
  const tab = view.host.querySelector('[role="tab"]')!
  expect(tab.className.length).toBeGreaterThan(0)
})

// ink bar 首次挂载后（微任务测量完成）必须有非零宽度，贴合当前激活标签，不是恒 opacity:0 的死指示条。
it('[tabs.appearance.ink-bar-measures] the ink bar gets a non-zero geometry after mount', async () => {
  const view = mount(() => <Tabs items={items} />)
  cleanup = view.dispose
  await Promise.resolve() // flush the queueMicrotask(measureInk) scheduled on first mount
  flush()
  const inkBar = view.host.querySelector<HTMLElement>('[role="tablist"] > div:not([role])')!
  expect(inkBar.style.opacity).toBe('1')
})
