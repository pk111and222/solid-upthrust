import { type Component, createSignal, Show } from 'solid-js'
import { Tree, moveTreeNode, Divider, Typography } from 'upthrust-ui'

const { Text } = Typography

const treeData = [
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

const deepTree = [
  {
    value: 'lv1', label: '一级', children: [
      { value: 'lv2', label: '二级', children: [
        { value: 'lv3', label: '三级', children: [
          { value: 'lv4', label: '四级', children: [
            { value: 'lv5', label: '五级' },
          ] },
        ] },
      ] },
    ],
  },
]

const TreePage: Component = () => {
  const [dragTree, setDragTree] = createSignal<import('upthrust-ui').TreeNode[]>(treeData)

  const [search, setSearch] = createSignal('')
  const [selected, setSelected] = createSignal<string[]>([])
  const [checked, setChecked] = createSignal<Array<string | number>>([])
  const [expanded, setExpanded] = createSignal<Array<string | number>>(['zj'])

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">Tree 树形控件</h2>
      <p class="text-on-surface-variant mb-6">
        展示层级数据，支持父子联动勾选、搜索、独立勾选与多选。使用方向键浏览节点，Enter 选择，空格勾选。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础 + 受控展开/选中</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <Tree
          treeData={treeData}
          expandedKeys={expanded()}
          onExpand={keys => setExpanded(keys as Array<string | number>)}
          selectedKeys={selected()}
          onSelect={keys => setSelected(keys as string[])}
        />
        <Text type="secondary">选中：{selected().join(', ') || '（无）'}</Text>
        <Text type="secondary">展开：{expanded().join(', ') || '（无）'}</Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">复选（checkable 级联）</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <Tree
          treeData={treeData}
          checkable
          defaultExpandAll
          checkedKeys={checked()}
          onCheck={keys => setChecked(keys as Array<string | number>)}
        />
        <Text type="secondary">
          勾选 keys：{checked().length ? checked().join(', ') : '（无）'} —— 注意「园区」disabled
          始终豁免，不影响「苏州」的全选状态。
        </Text>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">默认全展开 / 禁用分支</h3>
      <div class="max-w-xs flex flex-col gap-3">
        <Tree treeData={treeData} defaultExpandAll />
        <Show when={true}>
          <div class="border-t border-solid border-outline-variant pt-3">
            <Tree
              treeData={[
                { value: 'ok', label: '可用节点' },
                { value: 'no', label: '禁用分支', disabled: true, children: [
                  { value: 'child', label: '子节点（继承禁用）' },
                ] },
              ]}
            />
          </div>
        </Show>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">深层级与连接线</h3>
      <div class="max-w-xs">
        <Tree treeData={deepTree} defaultExpandAll showLine showIcon indent={28} />
      </div>
      <Divider />
      <h3 class="text-lg font-semibold mb-3">搜索与自定义节点</h3>
      <div class="max-w-sm">
        <Tree treeData={treeData} showSearch showLine showIcon searchValue={search()} onSearch={setSearch}
          icon={(node, expanded) => <span class={node.children?.length ? expanded ? 'i-mdi-folder-open-outline' : 'i-mdi-folder-outline' : 'i-mdi-map-marker-outline'} />}
          titleRender={node => <span>{node.label}<span class="ml-2 text-[12px] text-on-surface-variant">{node.value}</span></span>}
          notFoundContent="未找到匹配的地区" />
      </div>
      <Divider />
      <h3 class="text-lg font-semibold mb-3">多选与独立勾选</h3>
      <div class="max-w-sm">
        <Tree treeData={treeData} multiple checkable checkStrictly defaultExpandAll defaultSelectedKeys={['hz', 'nj']} defaultCheckedKeys={['zj']} />
      </div>
      <Divider />
      <h3 class="text-lg font-semibold mb-3">仅勾选 / 整体禁用 / 空数据</h3>
      <Tree treeData={treeData} checkable selectable={false} defaultExpandedKeys={['zj']} />
      <Tree treeData={treeData} disabled checkable defaultExpandAll />
      <Tree treeData={[]} />
      <Divider />
      <h3 class="text-lg font-semibold mb-3">节点拖拽：前 / 内 / 后</h3>
      <Tree treeData={dragTree()} draggable defaultExpandAll onDrop={info => {
        setDragTree(nodes => moveTreeNode(nodes, info.dragNode.value, info.node.value, info.dropPosition))
      }} />
      <p class="mt-2 text-on-surface-variant">拖到行上/下边缘调整顺序，拖到中部更换父节点。禁止拖入自身子树，禁用节点不可拖入拖出。</p>
    </div>
  )
}

export default TreePage
