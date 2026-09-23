import { createSignal } from 'solid-js'
import Transfer, { type TransferKey } from 'upthrust-ui/source/Transfer'

const resources = [
  { key: 'api', title: 'API 权限', description: '读取与写入' },
  { key: 'logs', title: '日志权限', description: '只读' },
  { key: 'admin', title: '管理权限', description: '锁定', disabled: true },
]

export default function OneWay() {
  const [targetKeys, setTargetKeys] = createSignal<TransferKey[]>(['logs'])
  return <div class="space-y-2">
    <Transfer dataSource={resources} targetKeys={targetKeys()} oneWay
      operations={['分配', '']} listStyle={{ width: '240px', height: '230px' }}
      render={item => <span>{item.title}<small class="ml-2 text-on-surface-variant">{item.description}</small></span>}
      footer={direction => direction === 'left' ? '锁定项不能移动' : '点击 × 单独移除'}
      onChange={next => setTargetKeys(next)} />
    <output class="block">已分配：{JSON.stringify(targetKeys())}</output>
  </div>
}
