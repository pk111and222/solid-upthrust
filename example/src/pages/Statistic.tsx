import { type Component, createSignal } from 'solid-js'
import { Statistic, StatisticCountdown, Divider, Space, Button } from 'upthrust-ui'

const deadline = Date.now() + 1000 * 60 * 60 * 8

const StatisticPage: Component = () => {
  const [precision, setPrecision] = createSignal(0)

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Statistic 统计数值</h2>
      <p class="text-on-surface-variant mb-6">展示统计数值与倒计时。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <Space size="large" wrap>
        <Statistic title="活跃用户" value={112893} />
        <Statistic title="余额" value={112893} precision={2} />
        <Statistic title="积分" value={93} suffix="分" />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">前后缀与数值样式</h3>
      <Space size="large" wrap>
        <Statistic title="价格" value={10998} prefix={<span class="text-[16px]">¥</span>} />
        <Statistic title="增长率" value={11.28} precision={2} prefix={<span class="i-mdi-arrow-up text-[16px] align-baseline" />} suffix="%" />
        <Statistic title="CPU" value={88} suffix="/ 100" valueStyle={{ color: '#cf1322' }} />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">千分位与小数位切换</h3>
      <Space size="large" align="center">
        <Statistic title="数值" value={98765432.1} precision={precision()} />
        <Button size="small" variant="outlined" onClick={() => setPrecision(p => (p + 1) % 5)}>
          precision = {precision()}
        </Button>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义分隔符</h3>
      <Space size="large">
        <Statistic title="默认" value={123456789} />
        <Statistic title="空格分组" value={123456789} groupSeparator=" " />
        <Statistic title="点号小数" value={1234567.89} decimalSeparator="," groupSeparator="." />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">formatter 与 loading</h3>
      <Space size="large">
        <Statistic
          title="格式化"
          value={99.9}
          formatter={(v) => <span class="text-[24px]">{Number(v).toFixed(1)} ฿</span>}
        />
        <Statistic title="加载中" value={112893} loading />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">倒计时</h3>
      <Space size="large" wrap>
        <StatisticCountdown title="剩余时间" value={deadline} />
        <StatisticCountdown title="精确到毫秒" value={deadline} format="HH:mm:ss:SSS" />
        <StatisticCountdown title="含天数" value={deadline} format="D 天 H 时 m 分 s 秒" />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">倒计时 onFinish</h3>
      <FinishDemo />
    </div>
  )
}

const FinishDemo: Component = () => {
  const [target, setTarget] = createSignal(Date.now() + 6000)
  const [finished, setFinished] = createSignal(false)

  return (
    <Space align="center">
      <StatisticCountdown
        title="6 秒倒计时"
        value={target()}
        onFinish={() => setFinished(true)}
      />
      <Button size="small" variant="outlined" onClick={() => { setFinished(false); setTarget(Date.now() + 6000) }}>
        重新开始
      </Button>
      {finished() && <span class="text-sm text-primary">已完成 ✓</span>}
    </Space>
  )
}

export default StatisticPage
