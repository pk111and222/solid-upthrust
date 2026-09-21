import Demo0 from '../../../docs/src/examples/switch/basic'
import Demo1 from '../../../docs/src/examples/switch/controlled'
import Demo2 from '../../../docs/src/examples/switch/sizes'
import Demo3 from '../../../docs/src/examples/switch/states'
import Demo4 from '../../../docs/src/examples/switch/aliases-ref'
import Demo5 from '../../../docs/src/examples/switch/context'
export default function SwitchPage(){return <div class="p-6 max-w-4xl space-y-6"><h2 class="text-2xl font-bold">Switch 开关</h2><section data-switch-demo="basic"><h3>基础状态</h3><Demo0/></section>
<section data-switch-demo="controlled"><h3>受控与事件</h3><Demo1/></section>
<section data-switch-demo="sizes"><h3>尺寸与方向</h3><Demo2/></section>
<section data-switch-demo="states"><h3>禁用与加载</h3><Demo3/></section>
<section data-switch-demo="aliases-ref"><h3>别名与原生 ref</h3><Demo4/></section>
<section data-switch-demo="context"><h3>Form 与全局配置</h3><Demo5/></section></div>}
