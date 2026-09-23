import Basic from './auto-complete-demos/basic'
import Filter from './auto-complete-demos/filter'
import Remote from './auto-complete-demos/remote'
import Variants from './auto-complete-demos/variants'
import Context from './auto-complete-demos/context'
import Keyboard from './auto-complete-demos/keyboard'
export default function AutoCompletePage() { return <div class="p-6 max-w-4xl"><h2 class="text-2xl font-bold mb-4">AutoComplete 自动补全</h2><p>支持自由文本、异步建议、表单与键盘补全。</p>
<section data-ac-demo="basic" class="my-6"><h3 class="text-lg font-semibold mb-3">自由文本与受控选值</h3><Basic /></section>
<section data-ac-demo="filter" class="my-6"><h3 class="text-lg font-semibold mb-3">默认值与自定义过滤</h3><Filter /></section>
<section data-ac-demo="remote" class="my-6"><h3 class="text-lg font-semibold mb-3">异步候选</h3><Remote /></section>
<section data-ac-demo="variants" class="my-6"><h3 class="text-lg font-semibold mb-3">尺寸、状态与禁用</h3><Variants /></section>
<section data-ac-demo="context" class="my-6"><h3 class="text-lg font-semibold mb-3">表单提交与重置</h3><Context /></section>
<section data-ac-demo="keyboard" class="my-6"><h3 class="text-lg font-semibold mb-3">受控浮层与键盘导航</h3><Keyboard /></section>
</div> }
