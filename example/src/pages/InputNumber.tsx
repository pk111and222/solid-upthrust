import Basic from '../../../docs/src/examples/input-number/basic'
import Controlled from '../../../docs/src/examples/input-number/controlled'
import Precision from '../../../docs/src/examples/input-number/precision'
import Format from '../../../docs/src/examples/input-number/format'
import States from '../../../docs/src/examples/input-number/states'
import Native from '../../../docs/src/examples/input-number/native'
import Context from '../../../docs/src/examples/input-number/context'
export default function InputNumberPage(){return <div class="p-6 max-w-4xl"><h2 class="text-2xl mb-6">InputNumber 数字输入框</h2>
<section class="mb-8"><h3 class="text-lg mb-3">基础输入</h3><div data-input-number-demo="basic"><Basic/></div></section>
<section class="mb-8"><h3 class="text-lg mb-3">受控与外部更新</h3><div data-input-number-demo="controlled"><Controlled/></div></section>
<section class="mb-8"><h3 class="text-lg mb-3">步长与精度</h3><div data-input-number-demo="precision"><Precision/></div></section>
<section class="mb-8"><h3 class="text-lg mb-3">格式化与装饰</h3><div data-input-number-demo="format"><Format/></div></section>
<section class="mb-8"><h3 class="text-lg mb-3">尺寸与状态</h3><div data-input-number-demo="states"><States/></div></section>
<section class="mb-8"><h3 class="text-lg mb-3">原生 ref 与事件</h3><div data-input-number-demo="native"><Native/></div></section>
<section class="mb-8"><h3 class="text-lg mb-3">表单与全局配置</h3><div data-input-number-demo="context"><Context/></div></section>
</div>}
