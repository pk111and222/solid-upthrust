import { type Component, createSignal, Show } from 'solid-js'
import { Segmented, Divider, Typography } from 'upthrust-ui'
import type { SegmentedItem } from 'upthrust-ui'

const { Text, Title } = Typography

const SegmentedPage: Component = () => {
  const [day, setDay] = createSignal<string | number>('mon')
  const [bare, setBare] = createSignal<string | number | undefined>(undefined)
  const [dows, setDows] = createSignal<string | number>('daily')
  const [sized, setSized] = createSignal<string | number>('list')
  const [blocked, setBlocked] = createSignal<string | number>('map')

  const days: SegmentedItem[] = [
    { label: '周一', value: 'mon' },
    { label: '周二', value: 'tue' },
    { label: '周三', value: 'wed', disabled: true },
    { label: '周四', value: 'thu' },
  ]

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">Segmented 分段控制器</h2>
      <p class="text-on-surface-variant mb-6">
        headless createSegmented 组合共享 createSelection 底座（maxSelect=1、不可反选——
        Radio.Group 同款机器）。滑块是测量几何：item 上报 offsetLeft/offsetWidth，
        machine 派生 thumb 盒（选中项或键盘遍历候选项），渲染层画一个带 transition 的
        绝对定位白片。←/→/Home/End 遍历、Enter 提交、Esc 取消。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础（受控）</h3>
      <div class="flex flex-col gap-3 mb-2">
        <Segmented options={days} value={day()} onChange={setDay} />
        <Text type="secondary">当前值：{String(day())}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">裸值数组</h3>
      <div class="flex flex-col gap-3 mb-2">
        <Segmented options={['每日', '每周', '每月']} value={bare()} onChange={setBare} />
        <Text type="secondary">
          当前值：<Show when={bare()} fallback="（空）">{String(bare())}</Show>
        </Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">带图标</h3>
      <div class="mb-2">
        <Segmented
          options={[
            { label: '列表', value: 'list', icon: <span class="i-mdi-format-list-bulleted" /> },
            { label: '卡片', value: 'card', icon: <span class="i-mdi-card-outline" /> },
            { label: '地图', value: 'map', icon: <span class="i-mdi-map-outline" /> },
          ]}
          value={dows()}
          onChange={setDows}
        />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">三种尺寸</h3>
      <div class="flex flex-col gap-3 mb-2">
        <Segmented options={['列表', '卡片']} size="small" value={sized()} onChange={setSized} />
        <Segmented options={['列表', '卡片']} value={sized()} onChange={setSized} />
        <Segmented options={['列表', '卡片']} size="large" value={sized()} onChange={setSized} />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">block 通栏</h3>
      <div class="mb-2 max-w-md">
        <Segmented
          block
          options={['地图', '转置', '平铺']}
          value={blocked()}
          onChange={setBlocked}
        />
      </div>
      <Text type="secondary">block 模式等宽铺满容器，滑块跟随测量。</Text>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">整组禁用</h3>
      <div class="mb-2">
        <Segmented options={['列表', '卡片']} disabled defaultValue="列表" />
      </div>

      <Divider />

      <Title level={5}>API 要点</Title>
      <ul class="list-disc pl-6 text-on-surface-variant text-sm leading-6">
        <li><Text code>options</Text>：{'{ label, value, disabled?, icon? }'} 或裸 string/number</li>
        <li><Text code>value / defaultValue</Text>：单键受控（Radio.Group 同形）</li>
        <li><Text code>block</Text>：通栏等宽</li>
        <li><Text code>size</Text>：small / middle / large</li>
        <li>键盘：Tab 进入组，← → Home End 遍历，Enter/Space 提交，Esc 取消</li>
      </ul>
    </div>
  )
}

export default SegmentedPage
