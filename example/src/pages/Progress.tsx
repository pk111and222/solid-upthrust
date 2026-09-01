import { type Component, createSignal, onCleanup } from 'solid-js'
import { Progress, Divider, Space, Button } from 'upthrust-ui'

const ProgressPage: Component = () => {
  const [percent, setPercent] = createSignal(30)
  const [autoPercent, setAutoPercent] = createSignal(0)

  // 自动增长演示
  const timer = setInterval(() => {
    setAutoPercent(p => (p >= 100 ? 0 : p + 2))
  }, 100)
  onCleanup(() => clearInterval(timer))

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Progress 进度条</h2>
      <p class="text-on-surface-variant mb-6">展示操作的当前进度。支持线性、圆形与分段步骤三种形态。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用与尺寸</h3>
      <Space size="large" direction="vertical" style={{ width: '100%' }}>
        <Progress percent={30} />
        <Progress percent={50} size="small" />
        <Progress percent={70} size="large" />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">状态</h3>
      <Space size="large" direction="vertical" style={{ width: '100%' }}>
        <Progress percent={100} status="success" />
        <Progress percent={50} status="exception" />
        <Progress percent={70} status="active" />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">交互控制</h3>
      <Space size="middle" class="mb-3">
        <Button size="small" variant="outlined" onClick={() => setPercent(Math.max(0, percent() - 10))}>-10</Button>
        <Button size="small" variant="outlined" onClick={() => setPercent(Math.min(100, percent() + 10))}>+10</Button>
      </Space>
      <Progress percent={percent()} />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义格式与隐藏文本</h3>
      <Space size="large" direction="vertical" style={{ width: '100%' }}>
        <Progress percent={75} format={(p) => `${p} / 100 项`} />
        <Progress percent={88} showInfo={false} />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自动增长（动画过渡）</h3>
      <Progress percent={autoPercent()} status={autoPercent() >= 100 ? 'success' : 'active'} />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">分段进度条</h3>
      <Space size="large" direction="vertical" style={{ width: '100%' }}>
        <Progress percent={autoPercent()} steps={5} />
        <Progress percent={60} steps={8} size="small" showInfo={false} />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">圆形进度条</h3>
      <Space size="large" align="center" wrap>
        <Progress type="circle" percent={autoPercent()} />
        <Progress type="circle" percent={100} status="success" size={80} />
        <Progress type="circle" percent={42} status="exception" size={80} />
        <Progress type="circle" percent={66} size={140} strokeWidth={8} />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义颜色</h3>
      <Space size="large" direction="vertical" style={{ width: '100%' }}>
        <Progress percent={40} strokeColor="#722ed1" />
        <Progress type="circle" percent={40} strokeColor="#722ed1" size={100} />
        <Progress percent={60} trailColor="rgba(0,0,0,0.06)" strokeColor="#13c2c2" />
      </Space>
    </div>
  )
}

export default ProgressPage
