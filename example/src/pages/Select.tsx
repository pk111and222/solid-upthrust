import { type Component, createSignal, Show } from 'solid-js'
import { Select, Space, Divider, Typography, type SelectOption } from 'upthrust-ui'

const { Text } = Typography

const SelectPage: Component = () => {
  const longOptions = Array.from({ length: 10000 }, (_, i) => ({ value: i, label: `选项 ${i}` }))

  const [single, setSingle] = createSignal<string | number | undefined>()
  const [multi, setMulti] = createSignal<Array<string | number>>([])
  const [searchVal, setSearchVal] = createSignal<string | number | undefined>()
  const [tagVals, setTagVals] = createSignal<Array<string | number>>([])
  const [lbv, setLbv] = createSignal<unknown>('（未选）')

  const options: SelectOption[] = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry' },
    { label: '葡萄', value: 'grape', disabled: true },
    { label: '芒果', value: 'mango' },
  ]

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">Select 选择器</h2>
      <p class="text-on-surface-variant mb-6">
        headless createSelect —— 底层选项机复用共享 createSelection（单选 = Radio 语义
        maxSelect:1，多选 = Checkbox 语义），下拉层复用 createTrigger（与 Dropdown /
        Popover 同一浮层机）。支持搜索、标签自由输入（tags）、labelInValue、maxTagCount。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础单选（受控）</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <Select
          options={options}
          value={single()}
          onChange={v => setSingle(v as string | number | undefined)}
          placeholder="请选择水果"
          allowClear
        />
        <Text type="secondary">当前值：{String(single() ?? '（未选）')}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">多选（multiple）</h3>
      <div class="max-w-sm flex flex-col gap-3">
        <Select
          options={options}
          mode="multiple"
          value={multi()}
          onChange={v => setMulti(v as Array<string | number>)}
          placeholder="可多选"
          allowClear
        />
        <Text type="secondary">当前值：{JSON.stringify(multi())}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">可搜索（showSearch）</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <Select
          options={options}
          showSearch
          value={searchVal()}
          onChange={v => setSearchVal(v as string | number | undefined)}
          placeholder="输入过滤"
        />
        <Text type="secondary">当前值：{String(searchVal() ?? '（未选）')}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">标签自由输入（tags）</h3>
      <div class="max-w-sm flex flex-col gap-3">
        <Select
          options={options}
          mode="tags"
          value={tagVals()}
          onChange={v => setTagVals(v as Array<string | number>)}
          placeholder="输入后回车创建标签"
          allowClear
        />
        <Text type="secondary">当前值：{JSON.stringify(tagVals())}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">maxTagCount / 禁用 / 尺寸 / 状态</h3>
      <Space direction="vertical" size="middle" class="w-72">
        <Select
          options={options}
          mode="multiple"
          defaultValue={['apple', 'banana', 'mango']}
          maxTagCount={1}
          placeholder="最多显示 1 个标签"
        />
        <Select options={options} disabled defaultValue="apple" placeholder="禁用" />
        <Select options={options} size="small" placeholder="small" />
        <Select options={options} size="large" placeholder="large" />
        <Select options={options} status="error" placeholder="错误状态" />
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">labelInValue</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <Select
          options={options}
          labelInValue
          defaultValue="banana"
          onChange={v => setLbv(v)}
          placeholder="选择后输出对象"
        />
        <Text type="secondary">当前值：{JSON.stringify(lbv() ?? '（未选）')}</Text>
      </div>
      <Divider />
      <h3 class="text-lg font-semibold mb-3">一万条选项：虚拟滚动与搜索</h3>
      <Select options={longOptions} showSearch listHeight={256} listItemHeight={32} placeholder="输入关键字，或用方向键选择" />
      <p class="text-on-surface-variant mt-2">默认仅渲染视口附近的选项；virtual=false 可关闭。自定义行高通过 listItemHeight 指定。</p>
    </div>
  )
}

export default SelectPage
