import { flush } from 'solid-js'
import { afterEach, expect, it } from 'vitest'
import { mount } from '../../utils/mount'
import Tabs from '../../../components/lib/Tabs'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {} })

const items = [
  { key: 'a', label: 'A', children: 'Panel A' },
  { key: 'b', label: 'B', children: 'Panel B' },
  { key: 'c', label: 'C', children: 'Panel C' },
]

// 方向键切换 activeKey 后，DOM 焦点必须跟随移动到新激活的标签本身，否则再按 Tab
// 会跳过标签列表直接进入面板内容——WAI-ARIA APG tabs 模式要求焦点跟随选中项移动。
it('[tabs.keyboard.focus-follows-active] ArrowRight moves both activeKey and DOM focus to the next tab', () => {
  const view = mount(() => <Tabs items={items} />)
  cleanup = view.dispose
  const tabs = view.host.querySelectorAll<HTMLElement>('[role="tab"]')
  tabs[0].focus()
  expect(document.activeElement).toBe(tabs[0])
  tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
  flush()
  expect(view.host.querySelector('[aria-selected="true"]')?.textContent).toBe('B')
  expect(document.activeElement).toBe(tabs[1])
})

// 容器和当前激活标签不应同时占用一个 Tab 键停靠点——WAI-ARIA APG 的 roving tabindex
// 模式里，tablist 容器本身不参与 Tab 顺序，只有活动标签是唯一停靠点。
it('[tabs.keyboard.single-tab-stop] the tablist container itself is not a separate Tab stop', () => {
  const view = mount(() => <Tabs items={items} />)
  cleanup = view.dispose
  const tablist = view.host.querySelector('[role="tablist"]')!
  expect(tablist.getAttribute('tabindex')).toBe('-1')
})
