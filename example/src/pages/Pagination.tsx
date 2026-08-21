import { type Component, createSignal, For } from 'solid-js'
import { Pagination, Divider } from 'upthrust-ui'
import { createPagination } from 'upthrust-competence'

// Preview of the Table-integration pattern: the headless createPagination
// drives both the pager UI and the data slice. Table will consume exactly
// this API (slice/rangeFor/itemRange).
const rows = Array.from({ length: 87 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${i + 1}`,
  role: i % 3 === 0 ? '管理员' : i % 3 === 1 ? '开发者' : '访客',
}))

const TableLikeDemo: Component = () => {
  const pager = createPagination({
    total: rows.length,
    defaultPageSize: 10,
  })

  return (
    <div>
      <div class="rounded-lg border border-outline-variant overflow-hidden">
        <table class="w-full text-[14px]">
          <thead>
            <tr class="bg-surface-variant/60 text-on-surface-variant">
              <th class="text-left font-medium px-[16px] py-[10px]">ID</th>
              <th class="text-left font-medium px-[16px] py-[10px]">姓名</th>
              <th class="text-left font-medium px-[16px] py-[10px]">角色</th>
            </tr>
          </thead>
          <tbody>
            <For each={pager.slice(rows)}>
              {(row) => (
                <tr class="border-t border-outline-variant">
                  <td class="px-[16px] py-[10px] text-on-surface-variant">{row.id}</td>
                  <td class="px-[16px] py-[10px]">{row.name}</td>
                  <td class="px-[16px] py-[10px]">{row.role}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
      <div class="mt-[16px] flex items-center justify-between">
        <span class="text-sm text-on-surface-variant">
          第 {pager.itemRange()[0]}-{pager.itemRange()[1]} 条 / 共 {rows.length} 条
        </span>
        <Pagination
          total={rows.length}
          pageSize={pager.pageSize()}
          current={pager.current()}
          onChange={(page, size) => { pager.changePageSize(size); pager.goTo(page) }}
        />
      </div>
    </div>
  )
}

const PaginationPage: Component = () => {
  const [current, setCurrent] = createSignal(3)
  const [cur2, setCur2] = createSignal(1)

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Pagination 分页</h2>
      <p class="text-on-surface-variant mb-6">采用分页的形式分隔长列表。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <Pagination total={50} />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">更多数据</h3>
      <Pagination total={500} defaultCurrent={25} />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">受控模式</h3>
      <Pagination
        current={current()}
        total={200}
        onChange={(page) => setCurrent(page)}
      />
      <p class="mt-2 text-sm text-on-surface-variant">当前第 {current()} 页</p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">显示总数</h3>
      <Pagination
        total={85}
        showTotal={(total, range) => <span>第 {range[0]}-{range[1]} 条 / 共 {total} 条</span>}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">改变页容量（pageSize 切换器）</h3>
      <Pagination
        total={200}
        defaultCurrent={5}
        pageSizeOptions={[10, 20, 50, 100]}
        onShowSizeChange={(cur, size) => console.log('size change:', cur, size)}
      />
      <p class="mt-2 text-sm text-on-surface-variant">切换每页条数时当前页自动收敛到有效范围（如第 5 页切 50 条/页 → 第 4 页）。</p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">快速跳转</h3>
      <Pagination total={500} showQuickJumper />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">完整能力</h3>
      <Pagination
        total={1000}
        pageSizeOptions={[10, 20, 50]}
        showQuickJumper
        showTotal={(total, range) => <span>{range[0]}-{range[1]} of {total}</span>}
        current={cur2()}
        onChange={(page) => setCur2(page)}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">Table 集成预览（headless 消费模式）</h3>
      <p class="text-sm text-on-surface-variant mb-3">
        下面的迷你表格完全由 <code class="text-primary">createPagination</code> 的
        <code class="text-primary"> slice / itemRange </code>驱动 —— 这就是未来 Table 物料的接线方式。
      </p>
      <TableLikeDemo />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">小尺寸</h3>
      <Pagination total={100} size="small" pageSizeOptions={[10, 20, 50]} />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">居中对齐</h3>
      <Pagination total={100} align="center" />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">禁用状态</h3>
      <Pagination total={100} disabled pageSizeOptions={[10, 20]} showQuickJumper />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">单页隐藏</h3>
      <p class="text-sm text-on-surface-variant mb-2">数据少于一页时隐藏分页器</p>
      <Pagination total={5} hideOnSinglePage />
    </div>
  )
}

export default PaginationPage
