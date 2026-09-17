import Basic from '../../../docs/src/examples/tabs/basic'
import Controlled from '../../../docs/src/examples/tabs/controlled'
import Disabled from '../../../docs/src/examples/tabs/disabled'
import Icon from '../../../docs/src/examples/tabs/icon'
import Card from '../../../docs/src/examples/tabs/card'
import Position from '../../../docs/src/examples/tabs/position'
import Size from '../../../docs/src/examples/tabs/size'
import Centered from '../../../docs/src/examples/tabs/centered'
import DestroyInactive from '../../../docs/src/examples/tabs/destroy-inactive'
import Editable from '../../../docs/src/examples/tabs/editable'
import Ref from '../../../docs/src/examples/tabs/ref'

export default function TabsPage() {
  return <div class="space-y-8">
    <section data-tabs-demo="basic">
      <h3 class="text-base font-medium mb-4">基本使用</h3>
      <Basic />
    </section>
    <section data-tabs-demo="controlled">
      <h3 class="text-base font-medium mb-4">受控模式</h3>
      <Controlled />
    </section>
    <section data-tabs-demo="disabled">
      <h3 class="text-base font-medium mb-4">禁用标签</h3>
      <Disabled />
    </section>
    <section data-tabs-demo="icon">
      <h3 class="text-base font-medium mb-4">带图标</h3>
      <Icon />
    </section>
    <section data-tabs-demo="card">
      <h3 class="text-base font-medium mb-4">卡片类型</h3>
      <Card />
    </section>
    <section data-tabs-demo="size">
      <h3 class="text-base font-medium mb-4">尺寸</h3>
      <Size />
    </section>
    <section data-tabs-demo="position">
      <h3 class="text-base font-medium mb-4">四个位置</h3>
      <Position />
    </section>
    <section data-tabs-demo="centered">
      <h3 class="text-base font-medium mb-4">居中</h3>
      <Centered />
    </section>
    <section data-tabs-demo="destroy-inactive">
      <h3 class="text-base font-medium mb-4">懒渲染（destroyInactiveTabPane）</h3>
      <DestroyInactive />
    </section>
    <section data-tabs-demo="editable">
      <h3 class="text-base font-medium mb-4">可编辑页签与拖拽排序</h3>
      <Editable />
    </section>
    <section data-tabs-demo="ref">
      <h3 class="text-base font-medium mb-4">ref 命令式控制</h3>
      <Ref />
    </section>
  </div>
}
