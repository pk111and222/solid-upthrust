import Demo0 from '../../../docs/src/examples/input/basic'
import Demo1 from '../../../docs/src/examples/input/controlled'
import Demo2 from '../../../docs/src/examples/input/affix'
import Demo3 from '../../../docs/src/examples/input/size-status'
import Demo4 from '../../../docs/src/examples/input/events'
import Demo5 from '../../../docs/src/examples/input/password'
import Demo6 from '../../../docs/src/examples/input/password-controlled'
import Demo7 from '../../../docs/src/examples/input/textarea'
import Demo8 from '../../../docs/src/examples/input/autosize'
import Demo9 from '../../../docs/src/examples/input/search'
import Demo10 from '../../../docs/src/examples/input/search-loading'
import Demo11 from '../../../docs/src/examples/input/context'
export default function InputPage() { return <div class="p-6 max-w-4xl space-y-8"><h2 class="text-2xl font-bold">Input 输入框</h2><section data-input-demo="basic"><h3 class="text-lg font-semibold mb-3">基础输入</h3><Demo0 /></section>
<section data-input-demo="controlled"><h3 class="text-lg font-semibold mb-3">受控、清空与计数</h3><Demo1 /></section>
<section data-input-demo="affix"><h3 class="text-lg font-semibold mb-3">动态前后缀</h3><Demo2 /></section>
<section data-input-demo="size-status"><h3 class="text-lg font-semibold mb-3">尺寸与状态</h3><Demo3 /></section>
<section data-input-demo="events"><h3 class="text-lg font-semibold mb-3">输入法、事件与原生 ref</h3><Demo4 /></section>
<section data-input-demo="password"><h3 class="text-lg font-semibold mb-3">Password 点击与悬停</h3><Demo5 /></section>
<section data-input-demo="password-controlled"><h3 class="text-lg font-semibold mb-3">Password 受控可见性</h3><Demo6 /></section>
<section data-input-demo="textarea"><h3 class="text-lg font-semibold mb-3">TextArea 多行与计数</h3><Demo7 /></section>
<section data-input-demo="autosize"><h3 class="text-lg font-semibold mb-3">TextArea 自动高度与销毁</h3><Demo8 /></section>
<section data-input-demo="search"><h3 class="text-lg font-semibold mb-3">Search 图标与按钮</h3><Demo9 /></section>
<section data-input-demo="search-loading"><h3 class="text-lg font-semibold mb-3">Search 加载状态</h3><Demo10 /></section>
<section data-input-demo="context"><h3 class="text-lg font-semibold mb-3">Form 字段注入与全局配置</h3><Demo11 /></section></div> }
