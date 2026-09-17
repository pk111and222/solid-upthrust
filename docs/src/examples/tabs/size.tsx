import Tabs from 'upthrust-ui/source/Tabs'

export default function Demo() {
  return <div class="flex flex-col gap-4">
    <Tabs size="small" items={[
      { key: '1', label: '选项卡一', children: <div class="pt-4 text-on-surface-variant">小尺寸内容</div> },
      { key: '2', label: '选项卡二', children: <div class="pt-4 text-on-surface-variant">小尺寸内容二</div> },
    ]} />
    <Tabs size="large" items={[
      { key: '1', label: '选项卡一', children: <div class="pt-4 text-on-surface-variant">大尺寸内容</div> },
      { key: '2', label: '选项卡二', children: <div class="pt-4 text-on-surface-variant">大尺寸内容二</div> },
    ]} />
  </div>
}
