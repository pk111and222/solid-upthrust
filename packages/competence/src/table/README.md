# Table headless engine

`createTable<T>(config)` 是原生 Solid 响应式表格引擎，不依赖 DOM、JSX、CSS 或第三方 Table 实现。本阶段只提供 competence，无组件页面。

设计参考 [TanStack Table Solid latest](https://tanstack.com/table/latest/docs/framework/solid/reference/index) 的状态分片和 row model 管线，以及 [Ant Design 6 Table](https://ant.design/components/table/) 的列、筛选、排序、选择、分页和展开契约。参考时 TanStack latest 为 v9；本 API 是项目自身的实现，不承诺与 TanStack 或 antd 直接替换兼容。

## 最小接入

```ts
import { createSignal } from 'solid-js'
import { createTable, type TableColumnDef } from 'upthrust-competence'

interface RecordItem { key: string; name: string; amount: number; status: string }
const [records, setRecords] = createSignal<readonly RecordItem[]>([])
const columns: TableColumnDef<RecordItem>[] = [
  { dataIndex: 'name', sorter: 'auto', fixed: 'start', width: 180 },
  { dataIndex: 'amount', sorter: 'auto', aggregation: 'sum' },
  { dataIndex: 'status', filters: [{ text: '完成', value: 'done' }],
    onFilter: (value, record) => record.status === value },
]
// 在 Solid owner（组件或 createRoot）中创建一次。
const table = createTable({
  get dataSource() { return records() },
  columns,
  pagination: { defaultPageSize: 20 },
  rowSelection: { preserveSelectedRowKeys: true },
  editing: {
    validate: record => record.amount < 0 ? { amount: '金额不能为负' } : undefined,
    onSave: record => { setRecords(items => items.map(item => item.key === record.key ? record : item)) },
  },
})

// 以下读取应放在响应式上下文中；命令适合事件处理器。
table.getHeaderGroups()
table.getCellRows() // 跳过 hidden；使用计算后的 rowSpan/colSpan
table.getRowModel().rows
table.toggleSorting('amount')
table.selection.toggleRow('order-1')
table.editing.begin('order-1')
table.editing.setValue('order-1', 'amount', 100)
await table.editing.commit('order-1')
```

数据、列、状态均使用不可变更新，通过 getter 传入响应式值。`getValue` 按核心行和列缓存；原地修改记录不会触发重算。必须提供唯一且稳定的 `key`，或 `rowKey` 属性名/函数。数字 `1` 与字符串 `'1'` 是不同键。重复键、循环树、无标识列会明确抛错。`dataIndex: ['profile', 'name']` 访问嵌套值，字符串中的点不会被拆分。没有 dataIndex 的 accessor 和分组列需要显式 key。

## 模块与管线

| 模块 | 职责 |
| --- | --- |
| `state.ts` | 分片状态、受控优先级、同批次命令组合、重置 |
| `rows.ts` / `columns.ts` | 索引、值缓存、嵌套列、表头、固定偏移和宽度 |
| `filtering.ts` / `sorting.ts` / `grouping.ts` | 本地查询、稳定多列排序、聚合和分面统计 |
| `selection.ts` | 单选、多选、范围、全选、反选、树联动、跨页保留 |
| `cells.ts` / `virtual.ts` | 合并覆盖矩阵、行高测量、窗口与滚动坐标 |
| `editing.ts` | 草稿、校验、保存和并发保护 |
| `createTable.ts` | 稳定实例、模型组合与公共命令 |

`core → filtered → grouped → sorted → expanded → paginated`。

所有阶段都有 getter，`getRowModel()` 返回最终显示顺序的扁平行列表。分页默认先切根行再展开，因此每页显示行数可能大于 pageSize；`paginateExpandedRows: true` 会按展开后的行数分页。`pagination: false` 显示全部展开行。分页号从 1 开始。`getPagination()` 返回有效页号，数据减少时会夹紧；原始状态保留请求值。

筛选是列间 AND、同列值间 OR。全局搜索默认遍历允许搜索的叶列。`filterFromLeafRows: true` 保留匹配后代的祖先。`sorter: 'auto'` 使用内置值比较；函数或 `{ compare, multiple }` 提供业务排序，multiple 越大优先级越高。`sorter: true` 只更新状态。没有 `onFilter` 的列只产生筛选状态。空值在升序末尾、降序开头。筛选和排序命令默认重置页号，可用 `autoResetPageIndex: false` 关闭。

`setGrouping` 使用叶列 ID，支持原始值和 Date 分组；对象分组应先通过 accessor 转成稳定标量。生成的分组行 `original` 为 undefined，不可编辑或勾选。分组对输入根记录分桶，原有子树保留；聚合取桶内根记录值。`getSummary(scope)` 则聚合指定范围内原始叶行，折叠父行本身不当作叶数据求和。内置 sum/min/max/mean/count/uniqueCount，也接受自定义聚合。`getFacetedValues(id)` 忽略当前列自身筛选，保留其他筛选和全局查询。

## 状态归属和远程数据

`state` 可控制任意完整分片，优先于 `pagination.current/pageSize`、`rowSelection.selectedRowKeys`、`expandable.expandedRowKeys` 和列 `sortOrder/filteredValue`。未受控分片内部维护。`initialState` 和各种 default 属性只初始化一次；`reset()` 提议恢复初始快照，受控部分仍由调用方决定。

`onStateChange(next, { action })` 收到完整候选状态，受控父级不接收时不会乐观修改可见模型。`setState(previous => partial)` 支持批量状态更新；它是底层操作，不代替专项命令触发业务回调。所有返回的状态和模型都应只读使用。

```ts
import type { TableState } from 'upthrust-competence'

const [state, setState] = createSignal<Partial<TableState>>({ sorters: [] })
const table = createTable({
  get dataSource() { return records() }, columns,
  get state() { return state() },
  onStateChange: next => setState(next),
})
```

服务器模式分别设置 `manualFiltering`、`manualSorting`、`manualPagination`，再用状态请求服务端并替换 dataSource。本引擎不发请求。`onChange(pagination, filters, sorter, extra)` 只在分页、筛选、排序专项命令时调用；extra.action 标记原因，currentDataSource 是候选状态的分页前原始记录（包含树后代，不含生成分组行）。多排序返回数组，无排序返回 null。服务器分页需提供 `pagination.total`；未知时 total 为 undefined、pageCount 为 -1，下一页可用性只根据当前页是否填满估计。

## 选择与展开

`selection` 提供 `selectedKeys/getSelectedRecords/getCheckState/getSelectAllState` 以及 `toggleRow/selectAll/invertSelection/clearSelection/selectRange`。全选和反选支持 page/filtered/all 范围；范围选择以当前显示顺序为准。disabled 行不参与用户操作。`checkStrictly` 默认 true；false 时联动后代并推导父级，禁用节点是联动边界。选择父节点会操作其完整启用子树，包括筛选隐藏的后代。

`preserveSelectedRowKeys` 保留远程页键及已见过的选中记录；未加载过的键无法凭空返回记录。不启用时 `selection.selectedKeys()` 排除当前数据中不存在的键；原始 selectedRowKeys 状态不自动写回清理。仅选中记录进入跨页缓存，清除选择后释放。

`toggleExpanded/setExpandedRowKeys/toggleAllExpanded` 操作树或详情展开状态。树有子节点即可展开；`rowExpandable` 用于额外启用没有子节点的详情面板。详情面板没有伪造数据行，由渲染层生成。defaultExpandAllRows 只作用于初始化时已加载的树/分组。

## 列、合并与虚拟窗口

共享 `column` 默认值被具体定义覆盖；分组 fixed 向子列继承。固定位置支持 start/end、left/right、true。`pinColumn` 操作叶列；`setColumnOrder/setColumnVisibility/setColumnWidth` 修改排列、显示与尺寸。responsive 根据调用方提供的 breakpoints 判断，不读取 window。

`getColumnLayout()` 给出宽度、固定区域偏移和区域边界；`getHeaderGroups()` 根据显示顺序拆分不连续或跨固定区域的表头组。宽度单位为像素，默认 150，默认最小 40。resize 命令接收指针坐标，支持 RTL、取消和宽度限制，不安装鼠标监听。

`onCell(record, pageRowIndex)` 提供附加属性和跨度。跨度为 0 时隐藏，超出当前页或固定区域会裁剪，已覆盖位置标记 hidden。遇到重叠矩形，前面的单元格优先，后面的跨度缩小。渲染层必须使用计算后的跨度，而不是将 props 中原始跨度覆盖回来。

`virtual` 提供 setViewport/setScrollTop、measureRow、virtualRows、totalHeight、spacerPadding 和 resolveScrollTo。resolveScrollTo 返回建议坐标，由调用方滚动容器。支持可变行高、overscan，并扩大窗口保留 rowSpan 的所有者。它是垂直窗口投影，核心模型与合并矩阵仍按当前页计算，不是无限数据加载或列虚拟化。超大合并区域可能让窗口退化为完整区域。行高按稳定 key 缓存；可用 clearMeasurements 清除，特别是数据集整体切换时。

## 编辑与扩展边界

`editing.begin/setValue/cancel/commit` 管理独立草稿。setValue 按 dataIndex 复制修改路径，不修改源记录，其余分支共享引用；校验器和保存回调也应不可变使用记录。编辑 accessor 列需 dataIndex。异步校验返回字段错误；保存异常放在 `_row`。再次修改、取消或销毁使旧校验结果失效；源记录被替换/移除时拒绝保存。保存进行中锁定草稿并拒绝取消，避免已提交外部请求后假装撤销。服务端最终冲突检测仍由 onSave 的实现负责。

`features` 是具名纯行模型转换器，可以插入 filtered/grouped/sorted 阶段；按数组顺序运行，不能修改输入模型，输出仍须满足唯一 ID/键和无环约束。扩展读取完整状态，可能因其他分片变化重新运行。

渲染层负责表格语义/ARIA、键盘焦点、排序筛选面板、loading/empty、详情内容、编辑器、拖拽事件、粘性定位和滚动 DOM。title、align、ellipsis、rowScope、shouldCellUpdate、meta 属于保留给渲染器的元数据，本引擎不会渲染或执行 shouldCellUpdate。当前未实现列拖拽 DOM、行拖拽、横向虚拟化和请求调度。

## 验证

`pnpm --dir packages/testing run test headless/Table` 覆盖状态归属、模型组合、树/分组、远程模式、缓存隔离、选择、列布局、合并、虚拟范围和异步编辑。无需启动页面。
