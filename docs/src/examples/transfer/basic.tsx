import { createSignal } from 'solid-js'
import Transfer, { type TransferKey } from 'upthrust-ui/source/Transfer'

const members = [
  { key: 0, title: '林一', description: '设计团队' },
  { key: 1, title: '周二', description: '研发团队' },
  { key: 2, title: '陈三', description: '运营团队' },
]

export default function Basic() {
  const [targetKeys, setTargetKeys] = createSignal<TransferKey[]>([2])
  const [selectedKeys, setSelectedKeys] = createSignal<TransferKey[]>([])
  const [lastMove, setLastMove] = createSignal('尚未移动')
  return <div class="space-y-2">
    <Transfer dataSource={members} targetKeys={targetKeys()} selectedKeys={selectedKeys()}
      titles={['候选成员', '项目成员']} operations={['加入', '移回']}
      onSelectChange={(left, right) => setSelectedKeys([...left, ...right])}
      onChange={(next, direction, moved) => {
        setTargetKeys(next)
        setLastMove(`${direction === 'right' ? '移入' : '移回'}：${moved.join(', ')}`)
      }} />
    <output class="block">目标键：{JSON.stringify(targetKeys())}；{lastMove()}</output>
  </div>
}
