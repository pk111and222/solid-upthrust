import Tabs from 'upthrust-ui/source/Tabs'

export default function Demo() {
  return <Tabs type="card" items={[
    { key: '1', label: '选项卡一', children: <div class="pt-4 text-on-surface-variant">卡片选项卡一的内容</div> },
    { key: '2', label: '选项卡二', children: <div class="pt-4 text-on-surface-variant">卡片选项卡二的内容</div> },
    { key: '3', label: '选项卡三', children: <div class="pt-4 text-on-surface-variant">卡片选项卡三的内容</div> },
  ]} />
}
