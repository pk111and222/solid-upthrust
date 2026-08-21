import { type Component, createSignal } from 'solid-js'
import { Steps, Divider, Button } from 'upthrust-ui'
import { createSteps } from 'upthrust-competence'

// Headless 消费预览：状态机直接驱动表单式向导 —— 步骤切换守卫（不能跳过
// 未完成步骤）完全由 createSteps.canGoTo/navigateTo 承担。
const WizardDemo: Component = () => {
  const wizard = createSteps({
    items: [
      { title: '填写信息' },
      { title: '确认订单' },
      { title: '支付' },
      { title: '完成' },
    ],
  })

  return (
    <div>
      <Steps
        current={wizard.current()}
        onChange={(c) => wizard.navigateTo(c)}
        items={[
          { title: '填写信息', description: ' 基本信息' },
          { title: '确认订单', description: ' 核对商品' },
          { title: '支付', description: ' 在线支付' },
          { title: '完成' },
        ]}
      />
      <div class="mt-4 flex items-center gap-2">
        <Button size="small" variant="outlined" disabled={!wizard.canGoTo(wizard.current() - 1)} onClick={() => wizard.prev()}>
          上一步
        </Button>
        <Button size="small" disabled={!wizard.canGoTo(wizard.current() + 1)} onClick={() => wizard.next()}>
          下一步
        </Button>
        <span class="text-sm text-on-surface-variant ml-2">
          当前进度 {wizard.percentOf()}%（第 {wizard.current() + 1} / 4 步）
        </span>
      </div>
      <p class="mt-2 text-sm text-on-surface-variant">
        注意：点击“下一步”只能前进一格，点击已完成的步骤可以回退 —— 守卫逻辑全部来自 headless 层。
      </p>
    </div>
  )
}

const StepsPage: Component = () => {
  const [current, setCurrent] = createSignal(1)
  const [errCurrent, setErrCurrent] = createSignal(1)

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Steps 步骤条</h2>
      <p class="text-on-surface-variant mb-6">引导用户按照流程完成任务的导航条。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <Steps
        current={current()}
        items={[
          { title: '登录' },
          { title: '验证' },
          { title: '付款' },
          { title: '完成' },
        ]}
      />
      <div class="mt-4 flex gap-2">
        <Button size="small" variant="outlined" onClick={() => setCurrent(p => Math.max(0, p - 1))}>上一步</Button>
        <Button size="small" onClick={() => setCurrent(p => Math.min(3, p + 1))}>下一步</Button>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">带副标题与描述</h3>
      <Steps
        current={1}
        items={[
          { title: '已完成', subTitle: '10:00', description: '这是描述信息' },
          { title: '进行中', subTitle: '11:00', description: '这是描述信息' },
          { title: '待执行', subTitle: '12:00', description: '这是描述信息' },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">小尺寸</h3>
      <Steps
        current={1}
        size="small"
        items={[
          { title: '已完成' },
          { title: '进行中' },
          { title: '待执行' },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">错误状态（可重试）</h3>
      <Steps
        current={errCurrent()}
        status="error"
        onChange={(c) => setErrCurrent(c)}
        items={[
          { title: '已完成' },
          { title: '验证失败' },
          { title: '付款' },
          { title: '完成' },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">竖直方向</h3>
      <Steps
        current={1}
        direction="vertical"
        items={[
          { title: '已完成', description: '这是描述信息' },
          { title: '进行中', description: '这是描述信息' },
          { title: '待执行', description: '这是描述信息' },
        ]}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">点状进度</h3>
      <Steps
        current={1}
        percent={60}
        progressDot
        items={[
          { title: '第一步' },
          { title: '第二步' },
          { title: '第三步' },
          { title: '第四步' },
        ]}
      />
      <p class="mt-2 text-sm text-on-surface-variant">percent=60，整体进度 {(1 + 0.6) / 4 * 100 | 0}%</p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">可点击（带导航守卫）</h3>
      <WizardDemo />
    </div>
  )
}

export default StepsPage
