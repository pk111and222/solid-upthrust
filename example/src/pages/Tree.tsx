import Demo0 from '../../../docs/src/examples/tree/basic'
import Demo1 from '../../../docs/src/examples/tree/controlled'
import Demo2 from '../../../docs/src/examples/tree/check'
import Demo3 from '../../../docs/src/examples/tree/strict'
import Demo4 from '../../../docs/src/examples/tree/disabled'
import Demo5 from '../../../docs/src/examples/tree/search'
import Demo6 from '../../../docs/src/examples/tree/appearance'
import Demo7 from '../../../docs/src/examples/tree/editable'
import Demo8 from '../../../docs/src/examples/tree/drag'
import Demo9 from '../../../docs/src/examples/tree/empty'
export default function TreePage() {
 return <div class="p-6 max-w-3xl space-y-8"><h2 class="text-2xl font-bold">Tree 树形控件</h2>
<section data-tree-demo="basic"><h3 class="text-lg font-semibold mb-3">默认展开与选中</h3><Demo0/></section>
<section data-tree-demo="controlled"><h3 class="text-lg font-semibold mb-3">受控状态与事件</h3><Demo1/></section>
<section data-tree-demo="check"><h3 class="text-lg font-semibold mb-3">级联复选与半选</h3><Demo2/></section>
<section data-tree-demo="strict"><h3 class="text-lg font-semibold mb-3">多选与独立勾选</h3><Demo3/></section>
<section data-tree-demo="disabled"><h3 class="text-lg font-semibold mb-3">整体禁用与禁用分支</h3><Demo4/></section>
<section data-tree-demo="search"><h3 class="text-lg font-semibold mb-3">受控搜索</h3><Demo5/></section>
<section data-tree-demo="appearance"><h3 class="text-lg font-semibold mb-3">连接线、缩进与图标</h3><Demo6/></section>
<section data-tree-demo="editable"><h3 class="text-lg font-semibold mb-3">标题内输入控件</h3><Demo7/></section>
<section data-tree-demo="drag"><h3 class="text-lg font-semibold mb-3">节点拖拽与数据更新</h3><Demo8/></section>
<section data-tree-demo="empty"><h3 class="text-lg font-semibold mb-3">空数据</h3><Demo9/></section>
</div>
}
