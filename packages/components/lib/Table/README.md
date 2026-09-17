# Table 表格物料

从 `upthrust-ui` 导入 `Table`、`TableColumnType<T>` 和 `TableRef<T>`。实现直接使用 `createTable`，无第三方 UI 依赖；headless 的受控状态、筛选、排序、分页、选择、分组和编辑契约保持一致。

```tsx
interface User { key: string; name: string; age: number }
const columns: TableColumnType<User>[] = [
  { title: '姓名', dataIndex: 'name', width: 180, fixed: 'start', resizable: true },
  { title: '年龄', dataIndex: 'age', sorter: 'auto', width: 100 },
]
<Table dataSource={users()} columns={columns} rowSelection={{}}
  pagination={{ defaultPageSize: 10, pageSizeOptions: [10, 20, 50] }}
  bordered sticky scroll={{ x: 800, y: 400 }} />
```

## 渲染能力

- `size`: small / middle（默认）/ large；`bordered`、`striped`、`loading`、`showHeader`。
- `caption`、`title(data)`、`footer(data)`、`emptyText`；`summary(data, table)` 返回 `tr/td`，放入 tfoot。
- 列 `render(value, record, pageIndex)` 返回 JSX；`ellipsis` 截断并为字符串/数字提供原生 title；`align`、`rowScope`、`class`。
- 列 `responsive` 自动跟随 xs/sm/md/lg/xl/xxl 媒体查询，也可传 `breakpoints` 接管结果。
- 分组列 `children` 生成多级表头；跨固定区域或重排不连续时拆分表头。固定列偏移根据浏览器实际列宽修正。
- `onCell` 支持附加属性和 rowSpan/colSpan。实际 JSX 使用计算后的跨度，覆盖位置不渲染。合并以当前页的数据行计算；不要在跨行合并区域同时插入详情行，否则原生 HTML 行跨度会包含详情行。
- `onRow` 传入行属性、样式和事件；`onRowClick` 为独立点击回调；`rowClassName` 支持字符串或函数。表格使用原生 HTML table 语义，交互通过按钮与输入控件的标准键盘行为操作。

## 操作与状态

点击排序列标题循环排序。支持多列优先级排序和 Shift 追加排序；列筛选弹层可搜索、选择、确认、重置，用 Portal 避免滚动区域裁剪。Escape 关闭菜单并回到触发按钮。

选择列提供当前页全选、半选、禁用、checkbox/radio 和 Shift 范围选择。`rowSelection.fixed` 固定选择列；通过 headless 实例可执行反选/清空/跨范围全选。已受控的原生 checkbox 不会在父级拒绝更新时错误地保持选中。

`expandable.expandedRowRender` 渲染详情；`rowExpandable` 决定详情资格。树子节点仍通过同一展开状态控制。`indentSize` 默认 16。

`resizable: true` 显示可拖动分隔线；支持指针、Escape 取消和聚焦后左右方向键调宽。尺寸按 minWidth/maxWidth 限制。其他列管理通过 ref.table 的 `setColumnVisibility`、`setColumnOrder`、`pinColumn` 执行。

## 编辑

传入 `editing` 启用行编辑操作列，列 `editable: true` 启用输入。默认根据值类型使用 text/number 输入；`editor(context)` 自定义编辑器，context 提供响应式 value、record、error、disabled、onChange。保存按钮触发 headless 校验和保存，错误就地展示；保存进行中锁定。默认输入 Enter 保存、Escape 取消。源数据由 onSave 所属业务代码不可变更新。

`shouldCellUpdate` 目前沿用 headless 列定义作为元数据保留，渲染层尚未使用它跳过重绘。

## 滚动与虚拟化

`scroll.x` 设置横向最小宽度，`scroll.y` 设置容器最大高度；`sticky` 固定容器内表头，可传 `{ offsetHeader }`。`virtual: true` 或 `{ estimateRowHeight, overscan }` 启用垂直虚拟范围，默认容器最高 400px。ResizeObserver 测量显示行，详情高度计入所属行。跨视口 rowSpan 会扩大渲染范围。

```tsx
let tableRef: TableRef<User> | undefined
<Table ref={value => { tableRef = value }} dataSource={users()} columns={columns}
  pagination={false} virtual scroll={{ y: 360 }} />
tableRef?.scrollTo({ key: 'user-501', align: 'start' })
tableRef?.table.selection.clearSelection()
```

定位限定在当前分页/展开结果；隐藏或未加载的行需先由调用方翻页、展开或加载。虚拟化不代替服务端请求，也不提供横向列虚拟化。

## 验证与示例

`example/src/pages/Table.tsx` 提供受控业务列表、行编辑、树形与详情、合并/分组汇总、千行虚拟滚动、空状态与隐藏表头演示。

- `pnpm --dir packages/testing run test render/Table`：物料 DOM 回归。
- `pnpm run test`：包含 headless 与物料的全仓回归。
