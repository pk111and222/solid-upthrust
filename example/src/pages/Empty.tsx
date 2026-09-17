import { type Component, createSignal, Show } from 'solid-js'
import { Empty, Button, Divider, Space } from 'upthrust-ui'
import { PRESENTED_IMAGE_SIMPLE } from 'upthrust-ui'

const CustomSVG = (
  <svg width="120" height="100" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="46" r="30" class="fill-surface-variant" />
    <path d="M50 46 L58 54 L72 38" class="stroke-primary" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <ellipse cx="60" cy="90" rx="40" ry="5" class="fill-outline-variant/30" />
  </svg>
)

const EmptyPage: Component = () => {
  const [hasData, setHasData] = createSignal(false)

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Empty 空状态</h2>
      <p class="text-on-surface-variant mb-6">空状态时的展示占位图。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <Empty />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">简洁样式</h3>
      <Empty image={<PRESENTED_IMAGE_SIMPLE />} description="暂无搜索结果" />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">无描述 / 自定义图片</h3>
      <div class="flex flex-col gap-8">
        <Empty image={false} description={false}>
          <span class="text-xs text-on-surface-variant">纯内容插槽</span>
        </Empty>
        <Empty image={CustomSVG} description="自定义插画" />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">带操作按钮</h3>
      <Empty description="还没有任何项目">
        <Button>新建项目</Button>
      </Empty>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">实际场景：列表空态切换</h3>
      <div class="rounded-lg border border-outline-variant p-4">
        <Show
          when={hasData()}
          fallback={
            <Empty image={<PRESENTED_IMAGE_SIMPLE />} description="列表为空">
              <Button size="small" onClick={() => setHasData(true)}>添加一条</Button>
            </Empty>
          }
        >
          <ul class="flex flex-col gap-2 text-on-surface">
            <li>第一条数据 —— Solid Signals 驱动</li>
            <li>第二条数据</li>
          </ul>
        </Show>
      </div>
    </div>
  )
}

export default EmptyPage
