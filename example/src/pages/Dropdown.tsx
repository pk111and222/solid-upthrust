import Basic from '../../../docs/src/examples/dropdown/basic'
import Click from '../../../docs/src/examples/dropdown/click'
import ContextMenu from '../../../docs/src/examples/dropdown/context-menu'
import Controlled from '../../../docs/src/examples/dropdown/controlled'
import Disabled from '../../../docs/src/examples/dropdown/disabled'
import Placement from '../../../docs/src/examples/dropdown/placement'
import Style from '../../../docs/src/examples/dropdown/style'
import Theme from '../../../docs/src/examples/dropdown/theme'
import Dynamic from '../../../docs/src/examples/dropdown/dynamic'
import Lifecycle from '../../../docs/src/examples/dropdown/lifecycle'
import Scroll from '../../../docs/src/examples/dropdown/scroll'

export default function DropdownPage() {
  return <div class="space-y-8">
    <section data-dropdown-demo="basic">
      <h3 class="text-base font-medium mb-4">默认悬停</h3>
      <Basic />
    </section>
    <section data-dropdown-demo="click">
      <h3 class="text-base font-medium mb-4">点击与回调顺序</h3>
      <Click />
    </section>
    <section data-dropdown-demo="context-menu">
      <h3 class="text-base font-medium mb-4">右键菜单</h3>
      <ContextMenu />
    </section>
    <section data-dropdown-demo="controlled">
      <h3 class="text-base font-medium mb-4">受控开关</h3>
      <Controlled />
    </section>
    <section data-dropdown-demo="disabled">
      <h3 class="text-base font-medium mb-4">触发器与菜单项禁用</h3>
      <Disabled />
    </section>
    <section data-dropdown-demo="placement">
      <h3 class="text-base font-medium mb-4">十二种位置</h3>
      <Placement />
    </section>
    <section data-dropdown-demo="style">
      <h3 class="text-base font-medium mb-4">自定义样式</h3>
      <Style />
    </section>
    <section data-dropdown-demo="theme">
      <h3 class="text-base font-medium mb-4">局部主题</h3>
      <Theme />
    </section>
    <section data-dropdown-demo="dynamic">
      <h3 class="text-base font-medium mb-4">动态与空列表</h3>
      <Dynamic />
    </section>
    <section data-dropdown-demo="lifecycle">
      <h3 class="text-base font-medium mb-4">默认打开与生命周期</h3>
      <Lifecycle />
    </section>
    <section data-dropdown-demo="scroll">
      <h3 class="text-base font-medium mb-4">滚动容器与 Portal</h3>
      <Scroll />
    </section>
  </div>
}
