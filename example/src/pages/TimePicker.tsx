import { type Component, createSignal, Show } from 'solid-js'
import { TimePicker, Space, Divider, Typography } from 'upthrust-ui'

const { Text } = Typography

const TimePickerPage: Component = () => {
  const [basic, setBasic] = createSignal<string | null>(null)
  const [withSeconds, setWithSeconds] = createSignal<string | null>('09:30:15')
  const [stepped, setStepped] = createSignal<string | null>(null)
  const [range, setRange] = createSignal<[string, string] | null>(['09:00', '17:30'])

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">TimePicker 时间选择器</h2>
      <p class="text-on-surface-variant mb-6">
        headless createTimePicker —— 时间值模型（parse/format/clamp/lattice 纯函数）+
        输入 buffer（blur 吸附，InputNumber 契约）+ 每列 active 键盘导航（Select
        契约）；浮层复用 createTrigger。面板为 antd 式多列（时/分/秒）滚轮。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础（受控）</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <TimePicker
          value={basic()}
          onChange={setBasic}
          placeholder="请选择时间"
        />
        <Text type="secondary">当前值：{basic() ?? '（空）'}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">带秒（format="HH:mm:ss"）</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <TimePicker
          format="HH:mm:ss"
          value={withSeconds()}
          onChange={setWithSeconds}
        />
        <Text type="secondary">当前值：{withSeconds() ?? '（空）'}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">时间范围（TimePicker.RangePicker）</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <TimePicker.RangePicker
          value={range()}
          onChange={setRange}
          placeholder={['开始时间', '结束时间']}
        />
        <Text type="secondary">当前区间：{range() ? `${range()![0]} ~ ${range()![1]}` : '（空）'}</Text>
        <TimePicker.RangePicker hourStep={2} minuteStep={15} placeholder={['hourStep=2', 'minuteStep=15']} />
        <TimePicker.RangePicker status="error" placeholder={['错误状态', '错误状态']} />
        <TimePicker.RangePicker disabled placeholder={['禁用', '禁用']} />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">步长 / 范围限制</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <TimePicker
          hourStep={3}
          minuteStep={15}
          value={stepped()}
          onChange={setStepped}
          placeholder="hourStep=3 minuteStep=15"
        />
        <TimePicker min="09:00" max="18:00" placeholder="09:00 ~ 18:00" />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">键盘操作</h3>
      <div class="max-w-xs flex flex-col gap-2">
        <Text type="secondary">
          聚焦后：↑/↓ 步进当前光标段（时或分），Enter 选中面板高亮项并关闭，Esc 关闭。
        </Text>
        <TimePicker placeholder="聚焦后按 ↑" />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">尺寸 / 状态 / 禁用</h3>
      <Space direction="vertical" size="middle" class="w-72">
        <TimePicker size="small" placeholder="small" />
        <TimePicker placeholder="middle（默认）" />
        <TimePicker size="large" placeholder="large" />
        <TimePicker status="error" placeholder="错误状态" />
        <TimePicker disabled placeholder="禁用" />
      </Space>
    </div>
  )
}

export default TimePickerPage
