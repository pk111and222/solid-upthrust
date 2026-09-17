import { createSignal } from 'solid-js'
import Tabs, { type TabsItem } from 'upthrust-ui/source/Tabs'

export default function Demo() {
  let nextTab = 2
  const [items, setItems] = createSignal<TabsItem[]>([
    { key: 'fixed', label: '固定页签', children: '首页内容', closable: false },
    { key: 'work', label: '工作页', children: '工作内容', closable: true },
  ])

  return <div class="flex flex-col gap-2">
    <Tabs
      type="editable-card"
      draggable
      items={items()}
      onEdit={(target, action) => {
        if (action === 'add') {
          const key = `new-${++nextTab}`
          setItems(list => [...list, { key, label: `新页签 ${nextTab}`, children: '动态内容', closable: true }])
        } else {
          setItems(list => list.filter(item => item.key !== target))
        }
      }}
      onReorder={reordered => setItems(reordered)}
    />
    <p class="text-sm text-on-surface-variant">点击 + 新增；关闭按钮或 Delete 删除；拖动页签或 Alt+左右方向键排序。固定页签不允许关闭。</p>
  </div>
}
