import { type Component, createSignal, Show } from 'solid-js'
import { DatePicker, RangePicker, Space, Divider, Typography } from 'upthrust-ui'

const { Text } = Typography

const DatePickerPage: Component = () => {
  const [basic, setBasic] = createSignal<string | null>(null)
  const [range, setRange] = createSignal<[string, string] | null>(null)
  const [picked, setPicked] = createSignal('')

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">DatePicker 日期选择器</h2>
      <p class="text-on-surface-variant mb-6">
        headless createDatePicker —— 日历数学（parse/format/月历矩阵/导航 纯函数）+ 值模型
        （'YYYY-MM-DD' 字符串，blur 吸附，TimePicker 契约）+ 面板视图（日/月/年三级钻取）
        + active 键盘导航（Select 契约）；浮层复用 createTrigger。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础（受控）</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <DatePicker
          value={basic()}
          onChange={v => { setBasic(v); if (v) setPicked(v) }}
          placeholder="请选择日期"
        />
        <Text type="secondary">当前值：{basic() ?? '（空）'}</Text>
        <Show when={picked()}>
          <Text type="secondary">最近选中：{picked()}</Text>
        </Show>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">默认值 / 周一起始</h3>
      <Space direction="vertical" size="middle" class="w-72">
        <DatePicker defaultValue="2026-09-02" placeholder="默认值" />
        <DatePicker weekStart={1} placeholder="周一起始" />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">范围选择（RangePicker）</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <RangePicker
          value={range()}
          onChange={setRange}
          placeholder={['开始日期', '结束日期']}
        />
        <Text type="secondary">当前区间：{range() ? `${range()![0]} ~ ${range()![1]}` : '（空）'}</Text>
        <Text type="secondary">
          交互：先点起始日（hover 预览区间）→ 再点结束日自动关闭；在结束日前重选会重新开始。
        </Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">受限范围 / 尺寸 / 状态</h3>
      <Space direction="vertical" size="middle" class="w-90">
        <RangePicker min="2026-09-01" max="2026-10-31" placeholder={['最早 09-01', '最晚 10-31']} />
        <RangePicker size="small" placeholder={['small', 'small']} />
        <RangePicker size="large" placeholder={['large', 'large']} />
        <RangePicker status="error" placeholder={['错误状态', '错误状态']} />
        <RangePicker disabled placeholder={['禁用', '禁用']} />
        <RangePicker defaultValue={['2026-09-01', '2026-09-15']} />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">范围与禁用（min/max + disabledDate）</h3>
      <Space direction="vertical" size="middle" class="w-72">
        <DatePicker min="2026-09-01" max="2026-09-30" placeholder="限 2026-09" />
        <DatePicker
          disabledDate={iso => new Date(iso).getDay() === 0 || new Date(iso).getDay() === 6}
          placeholder="禁用周末"
        />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">键盘操作</h3>
      <div class="max-w-xs flex flex-col gap-2">
        <Text type="secondary">
          面板打开后：←→↑↓ 移动高亮日，PageUp/PageDown 翻月，Enter 选中，Esc 关闭。
        </Text>
        <DatePicker placeholder="打开后按方向键" />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">尺寸 / 状态 / 禁用</h3>
      <Space direction="vertical" size="middle" class="w-72">
        <DatePicker size="small" placeholder="small" />
        <DatePicker placeholder="middle（默认）" />
        <DatePicker size="large" placeholder="large" />
        <DatePicker status="error" placeholder="错误状态" />
        <DatePicker disabled placeholder="禁用" />
      </Space>
      <Divider />
      <h3 class="text-lg font-semibold mb-3">周 / 季度 / 日期时间</h3>
      <div class="flex flex-col gap-3 max-w-md">
        <DatePicker picker="week" weekStart={1} defaultValue="2026-09-15" onChange={v => setPicked(v ?? '')} />
        <DatePicker picker="quarter" defaultValue="2026-07-01" onChange={v => setPicked(v ?? '')} />
        <DatePicker showTime={{ defaultValue: '09:00:00' }} defaultValue="2026-09-15 09:00:00" onChange={v => setPicked(v ?? '')} />
        <Text type="secondary">周/季度返回起始日期；日期时间返回 YYYY-MM-DD HH:mm:ss。当前：{picked()}</Text>
      </div>
      <h3 class="text-lg font-semibold my-3">快捷范围与时间范围</h3>
      <DatePicker.RangePicker showTime presets={[
        { label: '本周工作日', value: ['2026-09-14 09:00:00', '2026-09-18 18:00:00'] },
        { label: '今天（点击时计算）', value: () => { const day = new Date(); const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`; return [`${date} 00:00:00`, `${date} 23:59:59`] } },
      ]} onChange={setRange} />
      <p class="mt-2 text-on-surface-variant">{range()?.join(' ~ ')}</p>
      <DatePicker presets={[{ label: '项目起始日', value: '2026-09-01' }]} />
    </div>
  )
}

export default DatePickerPage
