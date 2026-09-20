import Demo0 from '../../../docs/src/examples/pagination/basic'
import Demo1 from '../../../docs/src/examples/pagination/controlled'
import Demo2 from '../../../docs/src/examples/pagination/page-size'
import Demo3 from '../../../docs/src/examples/pagination/jumper'
import Demo4 from '../../../docs/src/examples/pagination/appearance'
import Demo5 from '../../../docs/src/examples/pagination/disabled'
import Demo6 from '../../../docs/src/examples/pagination/dynamic'
import Demo7 from '../../../docs/src/examples/pagination/slice'
export default function PaginationPage() {
 return <div class="p-6 space-y-8"><h2 class="text-2xl font-bold">Pagination 分页</h2>
<section data-pagination-demo="basic"><h3 class="text-lg font-semibold mb-3">基本分页与总数</h3><Demo0 /></section>
<section data-pagination-demo="controlled"><h3 class="text-lg font-semibold mb-3">受控页码与容量</h3><Demo1 /></section>
<section data-pagination-demo="page-size"><h3 class="text-lg font-semibold mb-3">页容量事件</h3><Demo2 /></section>
<section data-pagination-demo="jumper"><h3 class="text-lg font-semibold mb-3">表单内快速跳转</h3><Demo3 /></section>
<section data-pagination-demo="appearance"><h3 class="text-lg font-semibold mb-3">尺寸与对齐</h3><Demo4 /></section>
<section data-pagination-demo="disabled"><h3 class="text-lg font-semibold mb-3">动态禁用</h3><Demo5 /></section>
<section data-pagination-demo="dynamic"><h3 class="text-lg font-semibold mb-3">总数变化与单页隐藏</h3><Demo6 /></section>
<section data-pagination-demo="slice"><h3 class="text-lg font-semibold mb-3">Headless 数据切片</h3><Demo7 /></section>
</div>
}
