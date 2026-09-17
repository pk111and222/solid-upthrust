import Tabs from 'upthrust-ui/source/Tabs'

export default function Demo() {
  return <div class="flex flex-col gap-6">
    <Tabs type="card" tabPosition="left" items={[
      { key: '1', label: '菜单一', children: <div class="pt-4 text-on-surface-variant">左侧卡片菜单一的内容</div> },
      { key: '2', label: '菜单二', children: <div class="pt-4 text-on-surface-variant">左侧卡片菜单二的内容</div> },
      { key: '3', label: '菜单三', children: <div class="pt-4 text-on-surface-variant">左侧卡片菜单三的内容</div> },
    ]} />
    <Tabs tabPosition="bottom" items={[
      { key: '1', label: '选项卡一', children: <div class="pb-4 text-on-surface-variant">底部位置：指示条在标签上方</div> },
      { key: '2', label: '选项卡二', children: <div class="pb-4 text-on-surface-variant">切到底部后 ink bar 朝上</div> },
    ]} />
  </div>
}
