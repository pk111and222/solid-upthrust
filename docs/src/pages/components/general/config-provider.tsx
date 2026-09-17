import type { PageMeta } from '../../../routing'
import { Demo, DemoGrid, Section, CodeBlock, ApiTable } from '../../../components/Content'
import fragmentSource from '../../../examples/config-provider/fragment.tsx?raw'
import api from './config-provider-api.json'
import basicSource from '../../../examples/config-provider/basic.tsx?raw'
import sizeSource from '../../../examples/config-provider/size.tsx?raw'
import disabledSource from '../../../examples/config-provider/disabled.tsx?raw'
import themeSource from '../../../examples/config-provider/theme.tsx?raw'
import nestedSource from '../../../examples/config-provider/nested.tsx?raw'
import formSource from '../../../examples/config-provider/form.tsx?raw'
import portalSource from '../../../examples/config-provider/portal.tsx?raw'
import styleSource from '../../../examples/config-provider/style.tsx?raw'
export const meta: PageMeta = {title:'ConfigProvider 全局配置',description:'为组件提供统一的默认属性与局部主题。',group:'组件',order:110}
export default function Page() { return <>
  <Section id="usage" title="使用方式"><p>适用于统一控件尺寸、禁用状态和品牌配色。不同区域可以独立配置，也可以按需嵌套。</p><CodeBlock code={"import { ConfigProvider } from 'upthrust-ui'"} /></Section>
  <Section id="examples" title="代码演示"><DemoGrid><Demo id="config-provider/basic" title="组件默认值" description="通过 components 为同一区域的控件设置默认属性。" source={basicSource} />
<Demo id="config-provider/fragment" title="无容器配置" description="wrapper=false 只提供默认属性，不产生额外 DOM；控件直接参与父级布局。" source={fragmentSource} />
<Demo id="config-provider/size" title="统一尺寸" description="调整 componentSize，同一区域的控件同步更新。" source={sizeSource} />
<Demo id="config-provider/disabled" title="禁用与显式覆盖" description="显式 disabled=false 高于区域默认值。" source={disabledSource} />
<Demo id="config-provider/theme" title="局部主题" description="配置语义颜色变量，切换品牌色。" source={themeSource} />
<Demo id="config-provider/nested" title="嵌套与隔离" description="内层覆盖指定属性；inherit=false 重置继承的组件默认值。" source={nestedSource} />
<Demo id="config-provider/form" title="表单优先级" description="Form 的尺寸和禁用配置优先于全局默认值。" source={formSource} />
<Demo id="config-provider/portal" title="弹层主题" description="弹层挂载到最近的配置作用域，延续局部颜色。" source={portalSource} />
<Demo id="config-provider/style" title="外部样式变量" description="使用 class 和 style 接入已有配色系统。" source={styleSource} /></DemoGrid></Section>
  <Section id="api" title="API"><ApiTable rows={api} /></Section>
  <Section id="contracts" title="注意事项"><p>wrapper=false 适合只提供默认属性的场景，不接受 theme、class 或 style；弹层沿用外层作用域，没有外层时挂到 body。需要局部主题时保留默认容器，或在已有祖先元素上定义 CSS 变量。wrapper 应在初始化时确定，运行中切换会重建子树。优先级：显式 props ＞ FormItem/Form 的尺寸和禁用 ＞ 组件默认值 ＞ 全局默认值。false 是有效覆盖。components 按物料浅合并，嵌套对象整体替换。inherit=false 只重置组件配置，CSS 颜色仍继承。theme 支持 hex/rgb/hsl，非法颜色忽略；prefix 默认 --upthrust，必须与 UnoCSS preset 一致。useConfig 无 Provider 时返回 null；useComponentProps 用于组件集成。暂不支持 locale、RTL、静态全局 setter 或自动暗色算法。</p></Section>
</> }
