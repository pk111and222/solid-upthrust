import { Component } from 'solid-js'
import Basic from '../../../docs/src/examples/button/basic'
import Variants from '../../../docs/src/examples/button/variants'
import Size from '../../../docs/src/examples/button/size'
import Icon from '../../../docs/src/examples/button/icon'
import Ghost from '../../../docs/src/examples/button/ghost'
import Block from '../../../docs/src/examples/button/block'
import Disabled from '../../../docs/src/examples/button/disabled'
import Link from '../../../docs/src/examples/button/link'
import Loading from '../../../docs/src/examples/button/loading'
import Duration from '../../../docs/src/examples/button/duration'
import Form from '../../../docs/src/examples/button/form'
import Native from '../../../docs/src/examples/button/native'
const ButtonPage: Component = () => <div class="space-y-8">
<section data-button-demo="basic"><h3 class="text-base font-medium mb-4">按钮类型</h3><Basic /></section>
<section data-button-demo="variants"><h3 class="text-base font-medium mb-4">外观与颜色</h3><Variants /></section>
<section data-button-demo="size"><h3 class="text-base font-medium mb-4">尺寸与形状</h3><Size /></section>
<section data-button-demo="icon"><h3 class="text-base font-medium mb-4">图标位置</h3><Icon /></section>
<section data-button-demo="ghost"><h3 class="text-base font-medium mb-4">幽灵按钮</h3><Ghost /></section>
<section data-button-demo="block"><h3 class="text-base font-medium mb-4">块级按钮</h3><Block /></section>
<section data-button-demo="disabled"><h3 class="text-base font-medium mb-4">禁用状态</h3><Disabled /></section>
<section data-button-demo="link"><h3 class="text-base font-medium mb-4">链接按钮</h3><Link /></section>
<section data-button-demo="loading"><h3 class="text-base font-medium mb-4">受控加载</h3><Loading /></section>
<section data-button-demo="duration"><h3 class="text-base font-medium mb-4">定时加载</h3><Duration /></section>
<section data-button-demo="form"><h3 class="text-base font-medium mb-4">原生表单</h3><Form /></section>
<section data-button-demo="native"><h3 class="text-base font-medium mb-4">原生属性与实例</h3><Native /></section>
</div>
export default ButtonPage
