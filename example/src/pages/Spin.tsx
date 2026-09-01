import { type Component, createSignal, onCleanup } from 'solid-js'
import { Spin, Divider, Button, Space, Alert } from 'upthrust-ui'

const SpinPage: Component = () => {
  const [loading, setLoading] = createSignal(false)

  // 模拟一个 200ms 的快速请求：无 delay 时会闪烁，有 delay 时完全无感
  const [fastFlash, setFastFlash] = createSignal(false)
  const [fastFlashDelayed, setFastFlashDelayed] = createSignal(false)
  let n = 0
  const timer = setInterval(() => {
    n++
    const on = n % 2 === 0
    setFastFlash(on)
    setFastFlashDelayed(on)
  }, 400)
  onCleanup(() => clearInterval(timer))

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Spin 加载中</h2>
      <p class="text-on-surface-variant mb-6">用于页面和区块的加载中状态。支持独立使用、嵌入内容、延迟出现与自定义指示器。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用与尺寸</h3>
      <Space size="middle" align="center">
        <Spin />
        <Spin size="small" />
        <Spin size="large" />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">文案与自定义指示器</h3>
      <Space size="large" align="center">
        <Spin tip="加载中..." />
        <Spin indicator={<span class="i-mdi-loading text-[24px] text-primary inline-block animate-spin-upthrust" />} />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">卡片加载中（嵌套模式）</h3>
      <Space size="middle" align="center">
        <Button variant={loading() ? 'solid' : 'outlined'} onClick={() => setLoading(!loading())}>
          {loading() ? '停止加载' : '开始加载'}
        </Button>
      </Space>
      <div class="mt-4">
        <Spin spinning={loading()}>
          <div style={{ 'min-width': '400px' }}>
            <Alert
              type="info"
              message="嵌套加载"
              description="正在加载的内容区域。切换上方按钮后，此区域会被半透明遮罩覆盖并显示加载指示器。"
            />
          </div>
        </Spin>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">延迟出现（防闪烁）</h3>
      <p class="text-sm text-on-surface-variant mb-3">下方两个区块每 400ms 切换一次 200ms 的短暂加载。无 delay 的指示器会持续闪烁；设置 delay 后快速完成的状态完全不打扰用户。</p>
      <Space size="large" align="start">
        <div class="text-center">
          <Spin spinning={fastFlash()} size="small" />
          <p class="text-xs text-on-surface-variant mt-2">无 delay（闪烁）</p>
        </div>
        <div class="text-center">
          <Spin spinning={fastFlashDelayed()} delay={300} size="small" />
          <p class="text-xs text-on-surface-variant mt-2">delay=300（无感）</p>
        </div>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">带 tip 的嵌套加载</h3>
      <Spin spinning={loading()} tip="数据加载中...">
        <div class="h-24 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface-variant" style={{ 'min-width': '400px' }}>
          内容区域
        </div>
      </Spin>
    </div>
  )
}

export default SpinPage
