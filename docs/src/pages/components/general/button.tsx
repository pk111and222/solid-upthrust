import type { PageMeta } from '../../../routing'
import { Demo, DemoGrid, Section, CodeBlock, ApiTable } from '../../../components/Content'
import api from './button-api.json'
import basicSource from '../../../examples/button/basic.tsx?raw'
import variantsSource from '../../../examples/button/variants.tsx?raw'
import sizeSource from '../../../examples/button/size.tsx?raw'
import iconSource from '../../../examples/button/icon.tsx?raw'
import ghostSource from '../../../examples/button/ghost.tsx?raw'
import blockSource from '../../../examples/button/block.tsx?raw'
import disabledSource from '../../../examples/button/disabled.tsx?raw'
import linkSource from '../../../examples/button/link.tsx?raw'
import loadingSource from '../../../examples/button/loading.tsx?raw'
import durationSource from '../../../examples/button/duration.tsx?raw'
import formSource from '../../../examples/button/form.tsx?raw'
import nativeSource from '../../../examples/button/native.tsx?raw'
export const meta: PageMeta = {title:'Button 按钮',description:'触发操作、提交表单或访问链接。',group:'组件',order:110}
export default function Page() { return <>
<Section id="usage" title="使用方式"><p>Button 是公开的基础交互组件。操作使用 button；跳转提供 href，渲染原生 a。图标按钮用 aria-label 提供名称。</p><CodeBlock code={"import { Button } from 'upthrust-ui'"} /></Section>
<Section id="examples" title="代码演示"><DemoGrid>
<Demo id="button/basic" title="按钮类型" description="五种 type 简写，type 只决定外观。" source={basicSource} />
<Demo id="button/variants" title="外观与颜色" description="variant 覆盖 type 的外观；danger 优先于 color。" source={variantsSource} />
<Demo id="button/size" title="尺寸与形状" description="small / middle / large；圆形图标按钮需提供可访问名称。" source={sizeSource} />
<Demo id="button/icon" title="图标位置" description="iconPlacement 指定图标前后位置。" source={iconSource} />
<Demo id="button/ghost" title="幽灵按钮" description="透明背景适合深色区域，也可与 danger 组合。" source={ghostSource} />
<Demo id="button/block" title="块级按钮" description="block 让按钮占满容器宽度。" source={blockSource} />
<Demo id="button/disabled" title="禁用状态" description="按钮使用原生 disabled，链接移除 href 并设置 aria-disabled。" source={disabledSource} />
<Demo id="button/link" title="链接按钮" description="非空 href 直接生成 a，整个按钮区域可激活。" source={linkSource} />
<Demo id="button/loading" title="受控加载" description="布尔 loading 由业务控制，加载图标替换自定义图标。" source={loadingSource} />
<Demo id="button/duration" title="定时加载" description="既有行为：点击后立即加载，delay 毫秒后结束，不是延迟显示。" source={durationSource} />
<Demo id="button/form" title="原生表单" description="htmlType 控制提交或重置；默认 button 不会提交。" source={formSource} />
<Demo id="button/native" title="原生属性与实例" description="透传 id、class、style、ARIA 与原生事件；ref 返回实例。" source={nativeSource} />
</DemoGrid></Section>
<Section id="api" title="API"><ApiTable rows={api} /></Section>
<Section id="contracts" title="行为约定"><p>优先级：显式 variant 优先于 type；danger 优先于 color，再回退到 type。ConfigProvider 可设置全局尺寸、禁用状态与组件默认值，显式属性优先。</p><p>loading=true 阻止重复激活并设置 aria-busy；loading=false 结束受控加载。对象形式保留既有定时加载行为，不自动等待 onClick 返回的 Promise。异步请求请使用布尔 loading，并在 finally 中复位。</p><p>实例包含 buttonEle()、anchorEle() 和 click()；当前未渲染的元素及卸载后返回 undefined。切换 href 会更换根节点。禁用链接退出 Tab 顺序，加载中的链接暂时移除 href；回调调用 preventDefault() 可以取消正常链接或表单行为。</p><p>htmlType 只用于 button 分支。尺寸为 24 / 32 / 40px。支持 class、style、ARIA、data-* 和原生事件；不支持自动插入汉字间距或自定义加载图标。此次未承诺与其他组件库 API 完全兼容。</p></Section>
</> }
