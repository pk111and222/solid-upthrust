import { type Component, createSignal, Show } from 'solid-js'
import { Cascader, Space, Divider, Typography, type CascaderOption } from 'upthrust-ui'

const { Text } = Typography

const CascaderPage: Component = () => {
  const longOptions = Array.from({ length: 5000 }, (_, i) => ({ value: i, label: `分类 ${i}`, children: [{ value: `child-${i}`, label: `子项 ${i}` }] }))

  const [basic, setBasic] = createSignal<Array<string | number> | undefined>()
  const [multi, setMulti] = createSignal<Array<Array<string | number>>>([])
  const [searchVal, setSearchVal] = createSignal<Array<string | number> | undefined>()
  const [checkVal, setCheckVal] = createSignal<Array<Array<string | number>>>([])
  const [lastNodes, setLastNodes] = createSignal('')

  const options: CascaderOption[] = [
    {
      value: 'zj', label: '浙江', children: [
        {
          value: 'hz', label: '杭州', children: [
            { value: 'xh', label: '西湖区' },
            { value: 'bj', label: '滨江区' },
            { value: 'yh', label: '余杭区' },
          ],
        },
        {
          value: 'nb', label: '宁波', children: [
            { value: 'hzq', label: '海曙区' },
            { value: 'yf', label: '鄞州区' },
          ],
        },
        { value: 'wz', label: '温州' },
      ],
    },
    {
      value: 'js', label: '江苏', children: [
        { value: 'nj', label: '南京' },
        {
          value: 'sz', label: '苏州', children: [
            { value: 'gs', label: '姑苏区' },
            { value: 'yq', label: '工业园区', disabled: true },
          ],
        },
      ],
    },
    { value: 'gd', label: '广东', children: [{ value: 'gz', label: '广州' }] },
  ]

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">Cascader 级联选择</h2>
      <p class="text-on-surface-variant mb-6">
        headless createCascader —— 选项机复用共享 createSelection（路径即 key，单选 =
        Radio 语义 maxSelect:1，多选 = Checkbox 语义），浮层复用 createTrigger。
        本层新增树模型（逐层列展开）、changeOnSelect、跨级搜索、checkable 父子联动。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础（受控）</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <Cascader
          options={options}
          value={basic()}
          onChange={(v, nodes) => {
            setBasic(v as Array<string | number> | undefined)
            setLastNodes(nodes.map(n => n.label).join('/'))
          }}
          placeholder="请选择地址"
        />
        <Text type="secondary">
          当前值：{basic() ? basic()!.join(' / ') : '（未选）'}
          <Show when={lastNodes()}>（{lastNodes()}）</Show>
        </Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">多选（multiple）</h3>
      <div class="max-w-sm flex flex-col gap-3">
        <Cascader
          options={options}
          mode="multiple"
          value={multi()}
          onChange={v => setMulti((v as Array<Array<string | number>>) ?? [])}
          placeholder="可多选"
        />
        <Text type="secondary">当前值：{JSON.stringify(multi())}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">可搜索（showSearch）</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <Cascader
          options={options}
          showSearch
          value={searchVal()}
          onChange={v => setSearchVal(v as Array<string | number> | undefined)}
          placeholder="输入过滤（如：园区）"
        />
        <Text type="secondary">当前值：{searchVal() ? searchVal()!.join(' / ') : '（未选）'}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">checkable 父子联动</h3>
      <div class="max-w-sm flex flex-col gap-3">
        <Cascader
          options={options}
          mode="multiple"
          checkable
          value={checkVal()}
          onChange={v => setCheckVal((v as Array<Array<string | number>>) ?? [])}
          placeholder="勾选区域"
        />
        <Text type="secondary">当前值：{JSON.stringify(checkVal())}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">changeOnSelect / 禁用 / hover 展开</h3>
      <Space direction="vertical" size="middle" class="w-72">
        <Cascader options={options} changeOnSelect placeholder="选任意层级即提交" />
        <Cascader options={options} disabled defaultValue={['zj', 'wz']} placeholder="禁用" />
        <Cascader options={options} expandTrigger="hover" placeholder="hover 展开子级" />
      </Space>
      <Divider />
      <h3 class="text-lg font-semibold mb-3">长列与搜索结果虚拟滚动</h3>
      <Cascader options={longOptions} showSearch listHeight={256} listItemHeight={32} placeholder="5000 个一级选项" />
    </div>
  )
}

export default CascaderPage
