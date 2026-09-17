import { type Component, createSignal, Show } from 'solid-js'
import { TreeSelect, Divider, Typography } from 'upthrust-ui'
import type { TreeSelectNode } from 'upthrust-ui'

const { Text } = Typography

const treeData: TreeSelectNode[] = [
  {
    value: 'zj', label: '浙江', children: [
      { value: 'hz', label: '杭州', children: [
        { value: 'xh', label: '西湖' },
        { value: 'bj', label: '滨江' },
      ] },
      { value: 'nb', label: '宁波' },
    ],
  },
  {
    value: 'js', label: '江苏', children: [
      { value: 'nj', label: '南京' },
      { value: 'sz', label: '苏州', children: [
        { value: 'yq', label: '园区', disabled: true },
      ] },
    ],
  },
]

const TreeSelectPage: Component = () => {
  const longTree = Array.from({ length: 10000 }, (_, i) => ({ value: i, label: `节点 ${i}` }))

  const [single, setSingle] = createSignal<string | number | undefined>(undefined)
  const [multi, setMulti] = createSignal<Array<string | number>>([])
  const [strict, setStrict] = createSignal<Array<string | number>>([])
  const [search, setSearch] = createSignal<string | number | undefined>(undefined)

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">TreeSelect 树选择</h2>
      <p class="text-on-surface-variant mb-6">
        headless createTreeSelect 组合 createTree —— 单选（行点击）/多选（checkbox 级联）/
        SHOW_PARENT 值折叠（父全勾时 value 只报父 key）/ checkStrictly 独立勾选 / 搜索剪枝。
        浮层复用 createTrigger，面板内嵌共享的 Tree 渲染器。
      </p>

      <h3 class="text-lg font-semibold mb-3">单选（受控）</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <TreeSelect
          treeData={treeData}
          value={single()}
          onChange={v => setSingle(v as string | number | undefined)}
          placeholder="请选择节点"
        />
        <Text type="secondary">当前值：{single() !== undefined ? String(single()) : '（空）'}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">多选（SHOW_PARENT 折叠）</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <TreeSelect
          treeData={treeData}
          mode="multiple"
          defaultExpandAll
          value={multi()}
          onChange={v => setMulti((v as Array<string | number>) ?? [])}
          placeholder="勾选节点"
        />
        <Text type="secondary">
          勾选「浙江」试试 —— value 只报 <code>['zj']</code>；部分勾选则逐个上报。
        </Text>
        <Text type="secondary">当前值：{multi().length ? multi().join(', ') : '（空）'}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">checkStrictly（父子独立）</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <TreeSelect
          treeData={treeData}
          mode="multiple"
          treeCheckStrictly
          defaultExpandAll
          value={strict()}
          onChange={v => setStrict((v as Array<string | number>) ?? [])}
          placeholder="独立勾选"
        />
        <Text type="secondary">勾父不勾子，value 含全部被勾 key。</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">可搜索</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <TreeSelect
          treeData={treeData}
          showSearch
          value={search()}
          onChange={v => setSearch(v as string | number | undefined)}
          placeholder="输入「西湖」试试"
        />
        <Text type="secondary">搜索时命中路径自动展开，命中 label 高亮。</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">尺寸 / 状态 / 禁用</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <TreeSelect treeData={treeData} size="small" placeholder="small" />
        <TreeSelect treeData={treeData} size="large" placeholder="large" />
        <TreeSelect treeData={treeData} status="error" placeholder="错误状态" />
        <TreeSelect treeData={treeData} disabled placeholder="禁用" />
        <TreeSelect treeData={[]} placeholder="空数据" notFoundContent="暂无节点" />
      </div>
      <Divider />
      <h3 class="text-lg font-semibold mb-3">虚拟树列表</h3>
      <TreeSelect treeData={longTree} showSearch listHeight={256} listItemHeight={32} placeholder="搜索 10000 个节点" />
    </div>
  )
}

export default TreeSelectPage
