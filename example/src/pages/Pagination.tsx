import { type Component, createSignal } from 'solid-js'
import { Pagination, Divider } from 'upthrust-ui'

const PaginationPage: Component = () => {
  const [current, setCurrent] = createSignal(3)

  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Pagination 分页</h2>
      <p class="text-gray-600 mb-6">采用分页的形式分隔长列表。</p>

      <h3 class="text-lg font-semibold mb-3">基本使用</h3>
      <Pagination total={50} />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">更多数据</h3>
      <Pagination total={500} />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">受控模式</h3>
      <Pagination
        current={current()}
        total={200}
        onChange={(page) => setCurrent(page)}
      />
      <p class="mt-2 text-sm text-gray-500">当前第 {current()} 页</p>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">显示总数</h3>
      <Pagination
        total={85}
        showTotal={(total, range) => <span>第 {range[0]}-{range[1]} 条 / 共 {total} 条</span>}
      />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">快速跳转</h3>
      <Pagination total={500} showQuickJumper />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">小尺寸</h3>
      <Pagination total={100} size="small" />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">居中对齐</h3>
      <Pagination total={100} align="center" />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">禁用状态</h3>
      <Pagination total={100} disabled />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">单页隐藏</h3>
      <p class="text-sm text-gray-500 mb-2">数据少于一页时隐藏分页器</p>
      <Pagination total={5} hideOnSinglePage />
    </div>
  )
}

export default PaginationPage
