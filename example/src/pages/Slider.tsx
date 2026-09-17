import { type Component, createSignal, Show } from 'solid-js'
import { Slider, Space, Divider, Typography } from 'upthrust-ui'
import type { SliderMark } from 'upthrust-ui'

const { Text } = Typography

const SliderPage: Component = () => {
  const [basic, setBasic] = createSignal(30)
  const [ranged, setRanged] = createSignal<[number, number]>([20, 60])
  const [marked, setMarked] = createSignal(37)

  const marks: SliderMark[] = [
    { value: 0, label: '0°C' },
    { value: 26, label: '26°C' },
    { value: 37, label: '37°C' },
    { value: 100, label: '100°C' },
  ]

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">Slider 滑动输入条</h2>
      <p class="text-on-surface-variant mb-6">
        headless createSlider —— 底层复用共享 createNumericValue 数值机（与 InputNumber / Rate
        同一引擎），本层只增加轨道百分比换算、拖拽与双滑块区间。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础（受控）</h3>
      <div class="max-w-md flex flex-col gap-3">
        <Slider value={basic()} onChange={setBasic} min={0} max={100} />
        <Text type="secondary">当前值：{basic()}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">步长与范围选择（双滑块）</h3>
      <div class="max-w-md flex flex-col gap-3">
        <Slider defaultValue={20} step={10} />
        <Slider
          defaultRangeValue={[20, 60]}
          onRangeChange={setRanged}
          min={0}
          max={100}
        />
        <Text type="secondary">区间：[{ranged()[0]}, {ranged()[1]}]</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">刻度标记 marks</h3>
      <div class="max-w-md flex flex-col gap-3">
        <Slider
          value={marked()}
          onChange={setMarked}
          min={0}
          max={100}
          marks={marks}
        />
        <Text type="secondary">当前值：{marked()}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">禁用 / 垂直</h3>
      <Space size="large" class="h-[220px]">
        <Slider defaultValue={30} vertical />
        <Slider defaultValue={70} vertical marks={[{ value: 0 }, { value: 50 }, { value: 100 }]} />
      </Space>
      <div class="mt-3 max-w-md">
        <Slider defaultValue={50} disabled />
      </div>
    </div>
  )
}

export default SliderPage
