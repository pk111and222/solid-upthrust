import { createSignal } from 'solid-js'
import Menu from 'upthrust-ui/source/Menu'

export default function Multiple() {
  const [keys, setKeys] = createSignal<string[]>(['a'])
  const [log, setLog] = createSignal('')
  return <div class="flex flex-col gap-sm">
    <Menu multiple triggerSubMenuAction="click" style={{ width: '256px' }} selectedKeys={keys()}
      onSelect={info => { setKeys(info.selectedKeys); setLog(`选中 ${info.key}`) }}
      onDeselect={info => { setKeys(info.selectedKeys); setLog(`取消 ${info.key}`) }}
      items={[
        { key: 'a', label: '选项 A' },
        { key: 'b', label: '选项 B' },
        { key: 'sub', label: '点击展开', children: [{ key: 'c', label: '选项 C' }, { key: 'd', label: '选项 D' }] },
      ]} />
    <output>{keys().join(', ') || '无'}；{log() || '—'}</output>
  </div>
}
