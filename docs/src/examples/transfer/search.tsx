import { createSignal } from 'solid-js'
import Transfer from 'upthrust-ui/source/Transfer'

const members = [
  { key: 'a', title: '甲', description: '设计团队' },
  { key: 'b', title: '乙', description: '研发团队' },
  { key: 'c', title: '丙', description: '设计团队', disabled: true },
  { key: 'd', title: '丁', description: '设计团队' },
]

export default function Search() {
  const [query, setQuery] = createSignal('')
  return <div class="space-y-2">
    <Transfer dataSource={members} showSearch searchPlaceholder="按姓名或团队筛选"
      filterOption={(input, item) => `${item.title} ${item.description}`.includes(input)}
      onSearch={(direction, value) => setQuery(`${direction === 'left' ? '左侧' : '右侧'}：${value}`)} />
    <output class="block">当前搜索：{query() || '无'}</output>
  </div>
}
