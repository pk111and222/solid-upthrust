import Basic from '../../../docs/src/examples/slider/basic'
import Controlled from '../../../docs/src/examples/slider/controlled'
import Range from '../../../docs/src/examples/slider/range'
import Marks from '../../../docs/src/examples/slider/marks'
import Directions from '../../../docs/src/examples/slider/directions'
import Native from '../../../docs/src/examples/slider/native'
import Context from '../../../docs/src/examples/slider/context'
export default function SliderPage(){return <div class="p-6 max-w-3xl"><h2 class="text-2xl mb-6">Slider 滑动输入条</h2>
<section class="mb-10"><h3 class="text-lg mb-3">基础与事件</h3><div data-slider-demo="basic"><Basic/></div></section>
<section class="mb-10"><h3 class="text-lg mb-3">受控进度</h3><div data-slider-demo="controlled"><Controlled/></div></section>
<section class="mb-10"><h3 class="text-lg mb-3">范围选择</h3><div data-slider-demo="range"><Range/></div></section>
<section class="mb-10"><h3 class="text-lg mb-3">刻度与步长</h3><div data-slider-demo="marks"><Marks/></div></section>
<section class="mb-10"><h3 class="text-lg mb-3">垂直与反向</h3><div data-slider-demo="directions"><Directions/></div></section>
<section class="mb-10"><h3 class="text-lg mb-3">禁用、ref 与卸载</h3><div data-slider-demo="native"><Native/></div></section>
<section class="mb-10"><h3 class="text-lg mb-3">Form 与全局配置</h3><div data-slider-demo="context"><Context/></div></section>
</div>}
