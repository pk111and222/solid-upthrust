import Basic from '../../../docs/src/examples/popover/basic'
import Trigger from '../../../docs/src/examples/popover/trigger'
import Controlled from '../../../docs/src/examples/popover/controlled'
import Disabled from '../../../docs/src/examples/popover/disabled'
import Style from '../../../docs/src/examples/popover/style'
import Container from '../../../docs/src/examples/popover/container'
import Placement from '../../../docs/src/examples/popover/placement'

export default function PopoverPage() {
  return <div class="space-y-8 pb-96">
    {/* pb-96：与 Tooltip 页同理，"十二种位置" demo 若恰好落在页面末尾，
        scrollIntoView({block:'center'}) 无法真正居中，bottom 系列按钮下方可用视口
        空间不足会被翻转策略误判，补足尾部空间保证任意 demo 居中时上下都有余量。 */}
    <section data-popover-demo="basic">
      <h3 class="text-base font-medium mb-4">基本使用</h3>
      <Basic />
    </section>
    <section data-popover-demo="trigger">
      <h3 class="text-base font-medium mb-4">触发方式</h3>
      <Trigger />
    </section>
    <section data-popover-demo="controlled">
      <h3 class="text-base font-medium mb-4">受控与 defaultOpen</h3>
      <Controlled />
    </section>
    <section data-popover-demo="disabled">
      <h3 class="text-base font-medium mb-4">禁用</h3>
      <Disabled />
    </section>
    <section data-popover-demo="style">
      <h3 class="text-base font-medium mb-4">自定义样式</h3>
      <Style />
    </section>
    <section data-popover-demo="container">
      <h3 class="text-base font-medium mb-4">局部主题与 getContainer</h3>
      <Container />
    </section>
    <section data-popover-demo="placement">
      <h3 class="text-base font-medium mb-4">十二种位置</h3>
      <Placement />
    </section>
  </div>
}
