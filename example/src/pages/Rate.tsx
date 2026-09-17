import { type Component, createSignal } from 'solid-js'
import { Rate, Space, Divider, Typography } from 'upthrust-ui'

const { Text } = Typography

const RatePage: Component = () => {
  const [basic, setBasic] = createSignal(3)
  const [half, setHalf] = createSignal(2.5)
  const [clearable, setClearable] = createSignal(4)
  const [last, setLast] = createSignal<number | string>('（未操作）')

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">Rate 评分</h2>
      <p class="text-on-surface-variant mb-6">
        headless createRate —— 底层复用共享 createNumericValue 数值机（与 InputNumber / Slider
        同一引擎，min=0 max=count step=0.5|1），本层只增加 hover 预览与半星。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础（受控）</h3>
      <div class="max-w-md flex flex-col gap-3">
        <Rate value={basic()} onChange={setBasic} />
        <Text type="secondary">当前值：{basic()} 星</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">半星 allowHalf</h3>
      <div class="max-w-md flex flex-col gap-3">
        <Rate value={half()} allowHalf onChange={setHalf} />
        <Text type="secondary">当前值：{half()} 星</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">可清空 / 禁用 / 自定义数量</h3>
      <Space direction="vertical" size="middle">
        <div class="flex items-center gap-3">
          <Rate value={clearable()} allowClear onChange={setClearable} />
          <Text type="secondary">当前值：{clearable()}（点当前值清零）</Text>
        </div>
        <Rate defaultValue={3} disabled />
        <Rate defaultValue={2} count={10} />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">非受控 + 事件</h3>
      <div class="max-w-md flex flex-col gap-3">
        <Rate defaultValue={3} onChange={v => setLast(v)} />
        <Text type="secondary">最近一次 onChange：{last()}</Text>
      </div>
    </div>
  )
}

export default RatePage
