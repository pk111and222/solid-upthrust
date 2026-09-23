import { type Component, createSignal, Show } from 'solid-js'
import { Select, Space, Divider, Typography, Form, FormItem, Button, type SelectOption } from 'upthrust-ui'
import type { FormInstance, Store } from 'upthrust-competence'

const { Text } = Typography

const SelectPage: Component = () => {
  const longOptions = Array.from({ length: 10000 }, (_, i) => ({ value: i, label: `选项 ${i}` }))

  const [single, setSingle] = createSignal<string | number | undefined>()
  const [multi, setMulti] = createSignal<Array<string | number>>([])
  const [searchVal, setSearchVal] = createSignal<string | number | undefined>()
  const [tagVals, setTagVals] = createSignal<Array<string | number>>([])
  const [lbv, setLbv] = createSignal<unknown>('（未选）')
  const [open, setOpen] = createSignal(false)
  const [search, setSearch] = createSignal('')
  const [event, setEvent] = createSignal('尚无事件')
  const [formResult, setFormResult] = createSignal('尚未提交')
  let form: FormInstance | undefined

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
      <div class="max-w-xs flex flex-col gap-3" data-select-demo="basic">
        <Select
          aria-label="水果"
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
      <div class="max-w-sm flex flex-col gap-3" data-select-demo="multiple">
        <Select
          aria-label="多选水果"
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
      <div class="max-w-xs flex flex-col gap-3" data-select-demo="search">
        <Select
          aria-label="搜索水果"
          options={options}
          showSearch
          allowClear
          value={searchVal()}
          onChange={v => setSearchVal(v as string | number | undefined)}
          placeholder="输入过滤"
        />
        <Text type="secondary">当前值：{String(searchVal() ?? '（未选）')}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">选项分组</h3>
      <div class="max-w-xs flex flex-col gap-3" data-select-demo="grouped">
        <Select aria-label="分组城市" showSearch options={[
          { label: '中国', options: [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }] },
          { label: '日本', options: [{ label: '东京', value: 'tokyo' }] },
        ]} placeholder="搜索城市" />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">标签自由输入（tags）</h3>
      <div class="max-w-sm flex flex-col gap-3" data-select-demo="tags">
        <Select
          aria-label="自定义标签"
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
      <div data-select-demo="variants"><Space direction="vertical" size="middle" class="w-72">
        <Select
          options={options}
          mode="multiple"
          defaultValue={['apple', 'banana', 'mango']}
          maxTagCount={1}
          maxTagPlaceholder={omitted => <span>另有 {omitted.length} 项</span>}
          placeholder="最多显示 1 个标签"
        />
        <Select aria-label="禁用选择" options={options} disabled defaultValue="apple" placeholder="禁用" />
        <Select aria-label="小尺寸" options={options} size="small" placeholder="small" />
        <Select aria-label="中尺寸" options={options} size="middle" placeholder="middle" />
        <Select aria-label="大尺寸" options={options} size="large" placeholder="large" />
        <Select aria-label="小尺寸可清空" options={options} size="small" defaultValue="apple" allowClear />
        <Select aria-label="大尺寸可清空" options={options} size="large" defaultValue="apple" allowClear />
        <Select aria-label="错误状态" options={options} status="error" placeholder="错误状态" />
        <Select aria-label="警告状态" options={options} status="warning" placeholder="警告状态" />
        <Select aria-label="加载状态" options={options} loading placeholder="加载状态" />
      </Space></div>

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
      <div data-select-demo="virtual"><Select aria-label="一万条选项" options={longOptions} showSearch listHeight={256} listItemHeight={32} placeholder="输入关键字，或用方向键选择" /></div>
      <p class="text-on-surface-variant mt-2">默认仅渲染视口附近的选项；virtual=false 可关闭。自定义行高通过 listItemHeight 指定。</p>

      <Divider />
      <h3 class="text-lg font-semibold mb-3">远端搜索式过滤、自定义菜单和受控浮层</h3>
      <div class="max-w-xs flex flex-col gap-3" data-select-demo="advanced">
        <Select aria-label="搜索与受控浮层" options={options} showSearch filterOption={false} onSearch={setSearch}
          open={open()} onOpenChange={setOpen} virtual={false} notFoundContent="没有结果"
          dropdownRender={menu => <div>{menu}<p class="px-3">菜单尾部内容</p></div>}
          onSelect={key => setEvent(`选择 ${key}`)} onDeselect={key => setEvent(`取消 ${key}`)} onClear={() => setEvent('已清空')}
          name="fruit" />
        <Button onClick={() => setOpen(value => !value)}>切换弹层</Button>
        <Text type="secondary">搜索：{search() || '空'}；{event()}</Text>
      </div>

      <Divider />
      <h3 class="text-lg font-semibold mb-3">Form.Item 提交与重置</h3>
      <div data-select-demo="context">
        <Form initialValues={{ fruit: 'apple' }} ref={instance => { form = instance }} onFinish={(values: Store) => setFormResult(JSON.stringify(values))}>
          <FormItem name="fruit" label="水果"><Select options={options} /></FormItem>
          <Space><Button type="primary" htmlType="submit">提交 Select</Button><Button onClick={() => { form?.resetFields(); setFormResult('尚未提交') }}>重置 Select</Button></Space>
        </Form>
        <Text type="secondary">{formResult()}</Text>
      </div>
    </div>
  )
}

export default SelectPage
