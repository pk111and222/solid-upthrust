import { createSignal } from 'solid-js'
import Tabs from 'upthrust-ui/source/Tabs'

export default function Demo() {
  const [activeKey, setActiveKey] = createSignal('1')

  return <Tabs
    activeKey={activeKey()}
    onChange={setActiveKey}
    items={[
      { key: '1', label: '标签一', children: <div class="pt-4 text-on-surface-variant">内容一：当前选中 {activeKey()}</div> },
      { key: '2', label: '标签二', children: <div class="pt-4 text-on-surface-variant">内容二：当前选中 {activeKey()}</div> },
      { key: '3', label: '标签三', children: <div class="pt-4 text-on-surface-variant">内容三：当前选中 {activeKey()}</div> },
    ]}
  />
}
