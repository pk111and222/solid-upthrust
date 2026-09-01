import { type Component, createSignal, onCleanup } from 'solid-js'
import { Skeleton, Divider, Button, Space } from 'upthrust-ui'

const SkeletonPage: Component = () => {
  const [loading, setLoading] = createSignal(true)
  const [autoLoading, setAutoLoading] = createSignal(true)

  // 自动切换演示 loading→内容→loading 的过渡
  const timer = setInterval(() => setAutoLoading(v => !v), 3000)
  onCleanup(() => clearInterval(timer))

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Skeleton 骨架屏</h2>
      <p class="text-on-surface-variant mb-6">在需要等待加载内容的位置提供一个占位图形组合。支持标题、段落、头像的组合与动画。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <Skeleton />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">带头像的组合</h3>
      <Skeleton avatar paragraph={{ rows: 3 }} />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">动画效果与圆角</h3>
      <Space size="large" direction="vertical" style={{ width: '100%' }}>
        <Skeleton active paragraph={{ rows: 2 }} />
        <Skeleton active round paragraph={{ rows: 2 }} title={{ width: '60%' }} />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义行数与宽度</h3>
      <Skeleton
        paragraph={{ rows: 4, width: ['100%', '80%', '60%', '40%'] }}
        title={{ width: '50%' }}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">加载完成切换真实内容</h3>
      <Space size="middle">
        <Button variant={loading() ? 'solid' : 'outlined'} onClick={() => setLoading(!loading())}>
          {loading() ? '显示内容' : '显示骨架'}
        </Button>
      </Space>
      <div class="mt-4 p-4 rounded-lg border border-outline-variant" style={{ 'min-height': '120px' }}>
        <Skeleton loading={loading()} avatar paragraph={{ rows: 2 }}>
          <div class="flex gap-3">
            <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary i-mdi-account" />
            <div>
              <div class="font-medium text-on-surface">用户名</div>
              <p class="text-on-surface-variant text-[14px] m-0">这是加载完成后显示的真实内容。骨架屏会在 loading=false 时切换到这里。</p>
            </div>
          </div>
        </Skeleton>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自动切换演示</h3>
      <Skeleton loading={autoLoading()} avatar active paragraph={{ rows: 2 }}>
        <div class="p-2">每 3 秒在骨架屏与内容之间切换。</div>
      </Skeleton>
    </div>
  )
}

export default SkeletonPage
