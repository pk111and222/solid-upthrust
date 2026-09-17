import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { mount } from '../../utils/mount'
import Tabs from '../../../components/lib/Tabs'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {} })

const baseItems = [
  { key: 'a', label: 'A', children: 'Panel A' },
  { key: 'b', label: 'B', children: 'Panel B', disabled: true },
  { key: 'c', label: 'C', children: 'Panel C' },
]

// 点击切换 activeKey，非受控模式下面板内容随之显示；未激活面板默认用 display:none 隐藏
// 而不是不挂载（destroyInactiveTabPane 默认 false）。
it('[tabs.switching.click] switches the active tab and toggles panel visibility via display', () => {
  const view = mount(() => <Tabs items={baseItems} />)
  cleanup = view.dispose
  const [tabA, , tabC] = view.host.querySelectorAll<HTMLElement>('[role="tab"]')
  const panels = view.host.querySelectorAll<HTMLElement>('[role="tabpanel"]')
  expect(panels[0].style.display).toBe('')
  expect(panels[2].style.display).toBe('none')
  expect(tabA.getAttribute('aria-selected')).toBe('true')

  tabC.click(); flush()
  expect(panels[0].style.display).toBe('none')
  expect(panels[2].style.display).toBe('')
  expect(tabC.getAttribute('aria-selected')).toBe('true')
})

// 禁用标签点击无效，也不触发任何回调。
it('[tabs.switching.disabled] clicking a disabled tab is a no-op', () => {
  const onChange = vi.fn()
  const view = mount(() => <Tabs items={baseItems} onChange={onChange} />)
  cleanup = view.dispose
  const tabB = view.host.querySelectorAll<HTMLElement>('[role="tab"]')[1]
  expect(tabB.getAttribute('aria-disabled')).toBe('true')
  tabB.click(); flush()
  expect(view.host.querySelector('[aria-selected="true"]')?.textContent).toBe('A')
  expect(onChange).not.toHaveBeenCalled()
})

// onChange 和 onTabClick 都触发，onTabClick 额外拿到原始 MouseEvent；受控模式下父层
// 必须自行更新 activeKey，组件不会自行漂移。
it('[tabs.switching.controlled] onChange/onTabClick fire with correct args; controlled value does not self-drift', () => {
  const onChange = vi.fn()
  const onTabClick = vi.fn()
  const [activeKey, setActiveKey] = createSignal('a', { ownedWrite: true })
  const view = mount(() => <Tabs activeKey={activeKey()} onChange={v => { onChange(v); }} onTabClick={onTabClick} items={baseItems} />)
  cleanup = view.dispose
  const tabC = view.host.querySelectorAll<HTMLElement>('[role="tab"]')[2]
  tabC.click(); flush()
  expect(onChange).toHaveBeenCalledWith('c')
  expect(onTabClick).toHaveBeenCalledWith('c', expect.any(MouseEvent))
  // Parent hasn't updated activeKey yet — controlled value must not drift on its own.
  expect(view.host.querySelector('[aria-selected="true"]')?.textContent).toBe('A')

  setActiveKey('c'); flush()
  expect(view.host.querySelector('[aria-selected="true"]')?.textContent).toBe('C')
})

// 图标类名可被静态扫描，且带 aria-hidden，不干扰标签的可访问名称。
it('[tabs.switching.icon] renders the icon class alongside the label', () => {
  const view = mount(() => <Tabs items={[{ key: 'a', label: '首页', icon: 'i-mdi-home', children: 'x' }]} />)
  cleanup = view.dispose
  const tab = view.host.querySelector('[role="tab"]')!
  expect(tab.querySelector('.i-mdi-home')).not.toBeNull()
  expect(tab.textContent).toContain('首页')
})
