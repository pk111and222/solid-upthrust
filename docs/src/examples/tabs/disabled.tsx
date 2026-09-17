import Tabs from 'upthrust-ui/source/Tabs'

export default function Demo() {
  return <Tabs items={[
    { key: '1', label: '可用', children: <div class="pt-4 text-on-surface-variant">可用标签的内容</div> },
    { key: '2', label: '禁用', disabled: true, children: <div class="pt-4 text-on-surface-variant">禁用标签的内容</div> },
    { key: '3', label: '可用', children: <div class="pt-4 text-on-surface-variant">另一个可用标签的内容</div> },
  ]} />
}
