import { createSignal } from 'solid-js'
import { Table, Tag, Button, Divider, Switch, type TableColumnType, type TableRef, type TableEditorContext } from 'upthrust-ui'
import type { TableState, TableKey } from 'upthrust-competence'

interface Member { key: string; name: string; team: string; age: number; amount: number; status: string; address: string; children?: Member[] }
const seed: Member[] = Array.from({ length: 28 }, (_, i) => ({ key: `member-${i + 1}`, name: ['林晓', '陈宇', '张悦', '李然', '王宁', '赵可'][i % 6] + (i >= 6 ? ` ${i + 1}` : ''), team: ['产品', '研发', '设计'][i % 3], age: 22 + i % 15, amount: 1200 + i * 180, status: i % 4 === 0 ? '待确认' : '已完成', address: `北京市海淀区科技园 ${i + 1} 号楼` }))
const columns: TableColumnType<Member>[] = [
  { title: '姓名', dataIndex: 'name', fixed: 'start', width: 160, sorter: 'auto', resizable: true, editable: true },
  { title: '团队', dataIndex: 'team', width: 130, filters: ['产品', '研发', '设计'].map(value => ({ text: value, value })), onFilter: (value, record) => record.team === value },
  { title: '年龄', dataIndex: 'age', width: 110, sorter: { multiple: 1, compare: (a, b) => a.age - b.age }, editable: true },
  { title: '金额', dataIndex: 'amount', width: 150, sorter: { multiple: 2, compare: (a, b) => a.amount - b.amount }, align: 'right', aggregation: 'sum', render: value => `¥ ${Number(value).toLocaleString()}`, editable: true },
  { title: '状态', dataIndex: 'status', width: 130, render: value => <Tag color={value === '已完成' ? 'success' : 'warning'}>{String(value)}</Tag> },
  { title: '地址', dataIndex: 'address', width: 250, ellipsis: true, responsive: ['lg'] },
]
const rowSpanData = [
  { key: 'row-1', team: '产品团队', name: '林晓', role: '产品经理', amount: 1200 },
  { key: 'row-2', team: '产品团队', name: '陈宇', role: '产品运营', amount: 1800 },
  { key: 'row-3', team: '产品团队', name: '张悦', role: '需求分析', amount: 1600 },
  { key: 'row-4', team: '研发团队', name: '李然', role: '前端开发', amount: 2400 },
  { key: 'row-5', team: '研发团队', name: '王宁', role: '后端开发', amount: 2600 },
]
const colSpanData = [
  { key: 'notice', kind: 'notice', name: '本月费用已确认，以下为团队成员明细。', team: '', role: '', amount: 0 },
  ...rowSpanData.slice(0, 3).map(record => ({ ...record, kind: 'member' })),
  { key: 'total', kind: 'total', name: '产品团队费用合计', team: '', role: '', amount: 4600 },
]
export default function TablePage() {
  const [data, setData] = createSignal(seed)
  const [selected, setSelected] = createSignal<readonly TableKey[]>([])
  const [state, setState] = createSignal<Partial<TableState>>({ sorters: [], filters: {} })
  const [loading, setLoading] = createSignal(false)
  const [bordered, setBordered] = createSignal(true)
  const [size, setSize] = createSignal<'small' | 'middle' | 'large'>('middle')
  const [log, setLog] = createSignal('点击表头排序、筛选团队，或勾选成员。按住 Shift 可选择范围。')
  let main: TableRef<Member> | undefined, virtual: TableRef<Member> | undefined, grouping: TableRef<Member> | undefined
  const tree = [{ ...seed[0], key: 'project', name: '企业工作台项目', children: seed.slice(1, 4) }, { ...seed[4], key: 'platform', name: '平台基础设施', children: seed.slice(5, 8) }]
  const many = Array.from({ length: 1000 }, (_, i) => ({ ...seed[i % seed.length], key: `virtual-${i}`, name: `成员 ${i + 1}` }))
  return <div class="p-6 max-w-[1400px] mx-auto">
    <h2 class="text-2xl font-bold mb-3">Table 表格</h2>
    <p class="text-on-surface-variant mb-6">从日常业务列表到树形数据、编辑与虚拟滚动。排序、筛选和分页可以独立受控。</p>
    <section aria-label="业务列表演示">
      <h3 class="text-lg font-semibold mb-3">业务列表 · 受控筛选、多列排序与固定列</h3>
      <div class="flex flex-wrap gap-4 items-center mb-4">
        <label class="flex gap-2 items-center"><Switch checked={bordered()} onChange={setBordered} />边框</label>
        <label class="flex gap-2 items-center"><Switch checked={loading()} onChange={setLoading} />加载状态</label>
        <label>密度 <select aria-label="表格密度" value={size()} onChange={e => setSize(e.currentTarget.value as 'small' | 'middle' | 'large')}><option value="small">紧凑</option><option value="middle">默认</option><option value="large">宽松</option></select></label>
        <Button onClick={() => main?.table.setColumnVisibility('address', main.table.getState().columnVisibility.address === false)}>显示 / 隐藏地址</Button>
        <Button onClick={() => main?.table.setColumnOrder(['name', 'amount', 'team', 'age', 'status', 'address'])}>金额列前移</Button>
        <Button onClick={() => main?.table.reset()}>重置表格</Button>
        <Button onClick={() => main?.table.selection.invertSelection()}>反选当前页</Button>
        <Button onClick={() => main?.table.selection.clearSelection()}>清空选择</Button>
      </div>
      <Table ref={ref => { main = ref }} aria-label="成员业务列表" dataSource={data()} columns={columns} state={state()} onStateChange={next => setState({ sorters: next.sorters, filters: next.filters })}
        rowSelection={{ selectedRowKeys: selected(), preserveSelectedRowKeys: true, fixed: true, getCheckboxProps: record => ({ disabled: record.key === 'member-4' }), onChange: setSelected }}
        bordered={bordered()} size={size()} loading={loading()} sticky scroll={{ x: 1100, y: 390 }}
        pagination={{ defaultPageSize: 5, pageSizeOptions: [5, 10, 20], showQuickJumper: true }}
        title={() => <div class="flex justify-between"><strong>团队成员</strong><span class="text-on-surface-variant">已选择 {selected().length} 项</span></div>}
        onChange={(_, filters, sorter, extra) => setLog(`${extra.action} · 筛选 ${JSON.stringify(filters)} · 排序 ${JSON.stringify(sorter)}`)}
        footer={() => <span class="text-[12px] text-on-surface-variant">拖动姓名列右侧分隔线调整宽度；分隔线聚焦后也可使用左右方向键。</span>} />
      <p role="status" class="text-[12px] text-on-surface-variant mt-3 break-all">{log()}</p>
    </section>
    <Divider />
    <section aria-label="编辑演示"><h3 class="text-lg font-semibold mb-3">行编辑 · 校验与保存</h3>
      <Table aria-label="可编辑成员" dataSource={data().slice(0, 3)} columns={columns.slice(0, 4).map(column => column.dataIndex === 'team' ? { ...column, editable: true, editor: (context: TableEditorContext<Member>) => <select aria-label="编辑团队" value={String(context.value)} disabled={context.disabled} onChange={e => context.onChange(e.currentTarget.value)}><option>产品</option><option>研发</option><option>设计</option></select> } : column)} pagination={false} bordered size="small"
        editing={{ validate: record => {
          const errors: Record<string, string> = {}
          if (!record.name.trim()) errors.name = '请输入姓名'
          if (!Number.isFinite(record.age) || record.age < 18) errors.age = '年龄至少为 18 岁'
          if (!Number.isFinite(record.amount) || record.amount < 0) errors.amount = '请输入有效金额'
          return errors
        }, onSave: record => { setData(previous => previous.map(item => item.key === record.key ? record : item)) } }} />
    </section>
    <Divider />
    <section aria-label="树形演示"><h3 class="text-lg font-semibold mb-3">树形数据 · 父子联动与详情展开</h3>
      <Table aria-label="项目树表格" dataSource={tree} columns={columns.slice(0, 3)} pagination={false} rowSelection={{ checkStrictly: false }}
        expandable={{ defaultExpandAllRows: true, rowExpandable: record => !record.children, expandedRowRender: record => <div class="py-2"><strong>{record.name}</strong> · {record.address}<p class="text-on-surface-variant text-sm">当前团队：{record.team}，状态：{record.status}</p></div> }} />
    </section>
    <Divider />
    <section aria-label="跨行合并演示">
      <h3 class="text-lg font-semibold mb-3">跨行合并 · rowSpan</h3>
      <p class="text-sm text-on-surface-variant mb-4">相邻成员的团队单元格纵向合并：产品团队占 3 行，研发团队占 2 行，其余列各自展示。</p>
      <Table aria-label="跨行合并表格" dataSource={rowSpanData} bordered pagination={false} columns={[
        { title: '团队（跨行合并）', dataIndex: 'team', width: 200, onCell: (_, index) => ({ rowSpan: index === 0 ? 3 : index === 3 ? 2 : 0 }) },
        { title: '姓名', dataIndex: 'name', width: 160 },
        { title: '岗位', dataIndex: 'role', width: 200 },
        { title: '费用', dataIndex: 'amount', width: 160, align: 'right', render: value => `¥ ${Number(value).toLocaleString()}` },
      ]} />
      <p class="text-[12px] text-on-surface-variant mt-3">通过 onCell 返回 rowSpan，合并起始单元格设置跨度，被覆盖单元格设置为 0。</p>
    </section>
    <Divider />
    <section aria-label="跨列合并演示">
      <h3 class="text-lg font-semibold mb-3">跨列合并 · colSpan</h3>
      <p class="text-sm text-on-surface-variant mb-4">首行说明横跨全部 4 列；末行合计标签横跨前 3 列，最后一列保留金额。</p>
      <Table aria-label="跨列合并表格" dataSource={colSpanData} bordered pagination={false} columns={[
        { title: '姓名 / 说明', dataIndex: 'name', width: 200, onCell: record => ({ colSpan: record.kind === 'notice' ? 4 : record.kind === 'total' ? 3 : 1 }) },
        { title: '团队', dataIndex: 'team', width: 160, onCell: record => ({ colSpan: record.kind === 'member' ? 1 : 0 }) },
        { title: '岗位', dataIndex: 'role', width: 200, onCell: record => ({ colSpan: record.kind === 'member' ? 1 : 0 }) },
        { title: '费用', dataIndex: 'amount', width: 160, align: 'right', onCell: record => ({ colSpan: record.kind === 'notice' ? 0 : 1 }), render: value => `¥ ${Number(value).toLocaleString()}` },
      ]} />
      <p class="text-[12px] text-on-surface-variant mt-3">通过 onCell 返回 colSpan，说明行和汇总行也可以直接放在表格数据中。</p>
    </section>
    <Divider />
    <section aria-label="分组演示"><h3 class="text-lg font-semibold mb-3">分组表头、合并单元格与汇总</h3>
      <Table aria-label="分组表头表格" dataSource={seed.slice(0, 4)} columns={[
        { key: 'identity', title: '成员资料', children: columns.slice(0, 3) },
        { key: 'business', title: '业务信息', children: [columns[3], { ...columns[4], onCell: (_, index) => ({ rowSpan: index === 1 ? 3 : 1 }) }] },
      ]} bordered pagination={false} summary={(_, table) => <tr><td colspan={3} class="p-3 font-semibold">合计</td><td colspan={2} class="p-3 font-semibold text-primary">¥ {String(table.getSummary().amount)}</td></tr>} />
      <h4 class="font-semibold mt-6 mb-3">按团队分组聚合</h4>
      <div class="flex gap-2 mb-3"><Button onClick={() => grouping?.table.toggleAllExpanded(true)}>展开全部分组</Button><Button onClick={() => grouping?.table.toggleAllExpanded(false)}>收起全部分组</Button></div>
      <Table ref={ref => { grouping = ref }} aria-label="团队聚合表格" dataSource={seed.slice(0, 6)} columns={[columns[1], columns[0], columns[3]]} initialState={{ grouping: ['team'] }} expandable={{ defaultExpandAllRows: true }} pagination={false} size="small" striped />
    </section>
    <Divider />
    <section aria-label="虚拟滚动演示"><h3 class="text-lg font-semibold mb-3">虚拟滚动 · 1,000 条记录</h3>
      <div class="mb-3 flex gap-2"><Button onClick={() => virtual?.scrollTo({ key: 'virtual-500', align: 'start' })}>定位第 501 行</Button><Button onClick={() => virtual?.scrollTo({ top: 0 })}>回到顶部</Button></div>
      <Table ref={ref => { virtual = ref }} aria-label="虚拟滚动成员" dataSource={many} columns={columns} pagination={false} virtual={{ estimateRowHeight: 49, overscan: 4 }} scroll={{ x: 1000, y: 300 }} sticky size="small" rowSelection={{ fixed: true }} />
    </section>
    <Divider />
    <section aria-label="空状态演示"><h3 class="text-lg font-semibold mb-3">空状态与隐藏表头</h3><Table aria-label="空表格" dataSource={[]} columns={columns.slice(0, 3)} pagination={false} caption="尚未分配成员" emptyText="暂无成员，添加后将在这里显示" /><div class="mt-4"><Table aria-label="无表头表格" dataSource={seed.slice(0, 2)} columns={columns.slice(0, 3)} pagination={false} showHeader={false} size="large" /></div></section>
  </div>
}
