import { type Component, createSignal } from 'solid-js'
import { Steps, Divider } from 'upthrust-ui'

const StepsPage: Component = () => {
  const [current, setCurrent] = createSignal(1)

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Steps 步骤条</h2>
      <p class="text-gray-600 mb-6">引导用户按照流程完成任务的导航条。</p>

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
        <button class="px-3 py-1 bg-blue-500 text-white rounded text-sm" onClick={() => setCurrent(p => Math.max(0, p - 1))}>上一步</button>
        <button class="px-3 py-1 bg-blue-500 text-white rounded text-sm" onClick={() => setCurrent(p => Math.min(3, p + 1))}>下一步</button>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">带描述</h3>
      <Steps
        current={1}
        items={[
          { title: '已完成', description: '这是描述信息' },
          { title: '进行中', description: '这是描述信息' },
          { title: '待执行', description: '这是描述信息' },
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

      <h3 class="text-lg font-semibold mb-3">错误状态</h3>
      <Steps
        current={1}
        status="error"
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

      <h3 class="text-lg font-semibold mb-3">可点击</h3>
      <Steps
        current={current()}
        onChange={(c) => setCurrent(c)}
        items={[
          { title: '步骤1' },
          { title: '步骤2' },
          { title: '步骤3' },
          { title: '步骤4' },
        ]}
      />
    </div>
  )
}

export default StepsPage
