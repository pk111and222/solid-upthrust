import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it } from 'vitest'
import { mount } from '../../utils/mount'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import Tabs from '../../../components/lib/Tabs'

let cleanup = () => {}
afterEach(() => { cleanup(); cleanup = () => {} })

// 最小 items 可以真实挂载并在受控更新下切换 activeKey。
it('[tabs.mount.basic] mounts through ConfigProvider and updates controlled activeKey', () => {
  const [activeKey, setActiveKey] = createSignal('a', { ownedWrite: true })
  const view = mount(() => (
    <ConfigProvider>
      <Tabs activeKey={activeKey()} onChange={setActiveKey} items={[
        { key: 'a', label: '第一项', children: '内容一' },
        { key: 'b', label: '第二项', children: '内容二' },
      ]} />
    </ConfigProvider>
  ))
  cleanup = view.dispose
  expect(view.host.querySelectorAll('[role="tab"]')).toHaveLength(2)
  expect(view.host.querySelector('[aria-selected="true"]')?.textContent).toBe('第一项')

  view.host.querySelectorAll<HTMLElement>('[role="tab"]')[1].click(); flush()
  expect(activeKey()).toBe('b')
  setActiveKey('b'); flush()
  expect(view.host.querySelector('[aria-selected="true"]')?.textContent).toBe('第二项')
})

// items 响应式更新应反映到已挂载组件，而不是固定初始快照；卸载后释放 DOM。
it('[tabs.mount.dynamic] follows items updates and cleans up on unmount', () => {
  const [items, setItems] = createSignal([{ key: 'a', label: '旧标签', children: 'x' }], { ownedWrite: true })
  const view = mount(() => <Tabs items={items()} />)
  cleanup = view.dispose
  expect(view.host.querySelector('[role="tab"]')?.textContent).toBe('旧标签')
  setItems([{ key: 'a', label: '新标签', children: 'x' }]); flush()
  expect(view.host.querySelector('[role="tab"]')?.textContent).toBe('新标签')

  view.dispose(); cleanup = () => {}
  expect(document.body.contains(view.host)).toBe(false)
})
