import { type Component, createSignal, onCleanup } from 'solid-js'
import { Anchor, Divider, Typography } from 'upthrust-ui'

const { Text } = Typography

const sections = [
  { id: 'part-1', title: 'Part 1', color: 'bg-primary-container' },
  { id: 'part-2', title: 'Part 2', color: 'bg-primary-container/60' },
  { id: 'part-3', title: 'Part 3', color: 'bg-primary-container/30' },
  { id: 'part-4', title: 'Part 4', color: 'bg-primary-container/60' },
]

const AnchorPage: Component = () => {
  const [controlledKey, setControlledKey] = createSignal('part-1')

  // The example app scrolls inside [data-appid=content], not the window —
  // find it and feed it to the anchors via getScrollContainer.
  const contentEl = document.querySelector<HTMLElement>('[data-appid=content]')
  const getScrollContainer = () => contentEl ?? undefined
  // Sections live inside the scroll container, so scroll events must be
  // observed there too.
  onCleanup(() => {})

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Anchor 锚点</h2>
      <p class="text-on-surface-variant mb-6">用于跳转到页面指定位置。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <div class="flex gap-8">
        <div class="shrink-0">
          <Anchor
            items={[
              { key: 'part-1', href: '#part-1', title: 'Part 1' },
              { key: 'part-2', href: '#part-2', title: 'Part 2' },
              { key: 'part-3', href: '#part-3', title: 'Part 3' },
              { key: 'part-4', href: '#part-4', title: 'Part 4' },
            ]}
            getScrollContainer={getScrollContainer}
            onChange={(key) => console.log('active:', key)}
          />
        </div>
        <div class="flex-1">
          {sections.map((s) => (
            <div id={s.id} class={`h-60 ${s.color} rounded-lg p-4 mb-4 transition-colors`}>
              <h4 class="font-medium">{s.title}</h4>
              <Text type="secondary" class="text-sm mt-2 block">滚动页面，左侧锚点高亮会跟随；点击锚点平滑滚动到对应区域。向上滚动会恢复之前的高亮（双向 scroll-spy）。</Text>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">水平方向（带滑动指示条）</h3>
      <Anchor
        direction="horizontal"
        items={[
          { key: 'part-1', href: '#part-1', title: 'Part 1' },
          { key: 'part-2', href: '#part-2', title: 'Part 2' },
          { key: 'part-3', href: '#part-3', title: 'Part 3' },
          { key: 'part-4', href: '#part-4', title: 'Part 4' },
        ]}
        getScrollContainer={getScrollContainer}
      />
      <div class="flex gap-4 mt-4">
        <div class="flex-1 h-24 bg-primary-container/30 rounded p-3">
          <span class="text-sm">水平锚点与垂直锚点共享目标区域</span>
        </div>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">嵌套锚点</h3>
      <div class="flex gap-8">
        <div class="shrink-0">
          <Anchor
            items={[
              { key: 'part-1', href: '#part-1', title: 'Part 1' },
              { key: 'part-2', href: '#part-2', title: 'Part 2', children: [
                { key: 'part-3', href: '#part-3', title: 'Part 3' },
                { key: 'part-4', href: '#part-4', title: 'Part 4' },
              ]},
            ]}
            getScrollContainer={getScrollContainer}
          />
        </div>
        <div class="flex-1">
          <Text type="secondary">子锚点缩进展示层级；scroll-spy 同样追踪嵌套目标。</Text>
        </div>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">受控模式（getCurrentAnchor）</h3>
      <div class="flex gap-8 items-start">
        <div class="shrink-0">
          <Anchor
            items={[
              { key: 'part-1', href: '#part-1', title: 'Part 1' },
              { key: 'part-2', href: '#part-2', title: 'Part 2' },
              { key: 'part-3', href: '#part-3', title: 'Part 3' },
              { key: 'part-4', href: '#part-4', title: 'Part 4' },
            ]}
            getCurrentAnchor={() => controlledKey()}
            getScrollContainer={getScrollContainer}
          />
        </div>
        <div class="flex gap-2 flex-wrap">
          {sections.map((s) => (
            <button
              class={`px-3 py-1 rounded border text-sm transition-upthrust-fast ${
                controlledKey() === s.id
                  ? 'border-primary text-primary bg-primary-container'
                  : 'border-outline-variant text-on-surface-variant hover:text-primary'
              }`}
              onClick={() => setControlledKey(s.id)}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AnchorPage
