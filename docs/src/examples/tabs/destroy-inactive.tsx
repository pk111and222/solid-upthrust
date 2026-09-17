import Tabs from 'upthrust-ui/source/Tabs'

export default function Demo() {
  return <div class="flex flex-col gap-2">
    <Tabs destroyInactiveTabPane items={[
      { key: '1', label: '保留状态', children: <div class="pt-4 text-on-surface-variant">切走再回来，这个面板会被销毁重建（状态丢失）</div> },
      { key: '2', label: '懒挂载', children: <div class="pt-4 text-on-surface-variant">这个面板只有在首次激活时才会挂载</div> },
    ]} />
    <p class="text-sm text-on-surface-variant">默认模式下所有面板都会渲染（display 切换），保留各自内部状态；destroyInactiveTabPane 会让未激活面板整个不挂载。</p>
  </div>
}
