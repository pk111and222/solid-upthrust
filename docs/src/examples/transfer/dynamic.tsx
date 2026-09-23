import { createSignal } from 'solid-js'
import Transfer, { type TransferItem, type TransferKey } from 'upthrust-ui/source/Transfer'

const initial: TransferItem[] = [{ key: 0, title: '甲' }, { key: '0', title: '乙' }]

export default function Dynamic() {
  const [items, setItems] = createSignal(initial)
  const [targetKeys, setTargetKeys] = createSignal<TransferKey[]>([0])
  return <div class="space-y-2">
    <Transfer dataSource={items()} targetKeys={targetKeys()} onChange={next => setTargetKeys(next)} />
    <div class="flex gap-2">
      <button type="button" onClick={() => setItems([...initial, { key: 3, title: '新成员' }])}>加入数据</button>
      <button type="button" onClick={() => setItems(initial)}>恢复数据</button>
    </div>
    <output class="block">目标键：{JSON.stringify(targetKeys())}</output>
  </div>
}
