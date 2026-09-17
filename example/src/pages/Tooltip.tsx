import Basic from '../../../docs/src/examples/tooltip/basic'
import Trigger from '../../../docs/src/examples/tooltip/trigger'
import Controlled from '../../../docs/src/examples/tooltip/controlled'
import DisabledDelay from '../../../docs/src/examples/tooltip/disabled-delay'
import Style from '../../../docs/src/examples/tooltip/style'
import Container from '../../../docs/src/examples/tooltip/container'
import Ref from '../../../docs/src/examples/tooltip/ref'
import Placement from '../../../docs/src/examples/tooltip/placement'

export default function TooltipPage() {
  return <div class="space-y-8 pb-96">
    {/* pb-96: 与文档站不同，此页无长篇正文；"十二种位置" demo 若恰好落在页面末尾，
        scrollIntoView({block:'center'}) 无法真正居中，bottom 系列按钮下方可用视口
        空间不足会被翻转策略误判。补足尾部空间，保证任意 demo 居中时上下都有余量。 */}
    <section data-tooltip-demo="basic">
      <h3 class="text-base font-medium mb-4">基本使用</h3>
      <Basic />
    </section>
    <section data-tooltip-demo="trigger">
      <h3 class="text-base font-medium mb-4">触发方式</h3>
      <Trigger />
    </section>
    <section data-tooltip-demo="controlled">
      <h3 class="text-base font-medium mb-4">受控与 defaultOpen</h3>
      <Controlled />
    </section>
    <section data-tooltip-demo="disabled-delay">
      <h3 class="text-base font-medium mb-4">禁用与延迟</h3>
      <DisabledDelay />
    </section>
    <section data-tooltip-demo="style">
      <h3 class="text-base font-medium mb-4">自定义样式</h3>
      <Style />
    </section>
    <section data-tooltip-demo="container">
      <h3 class="text-base font-medium mb-4">局部主题与 getContainer</h3>
      <Container />
    </section>
    <section data-tooltip-demo="ref">
      <h3 class="text-base font-medium mb-4">ref 命令式控制</h3>
      <Ref />
    </section>
    <section data-tooltip-demo="placement">
      <h3 class="text-base font-medium mb-4">十二种位置</h3>
      <Placement />
    </section>
  </div>
}
