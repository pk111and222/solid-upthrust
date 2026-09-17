import type { PageMeta } from '../../../routing'
import { Demo, DemoGrid, Section, CodeBlock, ApiTable } from '../../../components/Content'
import api from './icon-api.json'
import basicSource from '../../../examples/icon/basic.tsx?raw'
import sizeSource from '../../../examples/icon/size.tsx?raw'
import colorSource from '../../../examples/icon/color.tsx?raw'
import spinSource from '../../../examples/icon/spin.tsx?raw'
import rotateSource from '../../../examples/icon/rotate.tsx?raw'
import actionSource from '../../../examples/icon/action.tsx?raw'
export const meta: PageMeta = {title:'Icon 图标',description:'语义清晰、尺寸灵活的 Iconify 图标。',group:'组件',order:111}
export default function Page() { return <>
  <Section id="usage" title="使用方式"><p>用于按钮、导航和状态提示。图标本身是 span；交互行为由外层按钮承载。</p><CodeBlock code={"import { Icon } from 'upthrust-ui'"} /></Section>
  <Section id="examples" title="代码演示"><DemoGrid><Demo id="icon/basic" title="基本用法" description="使用 collection:name 指定图标，省略集合时默认使用 mdi。" source={basicSource} />
<Demo id="icon/size" title="图标尺寸" description="三种预设尺寸，也可以传入像素值或 CSS 长度。" source={sizeSource} />
<Demo id="icon/color" title="语义颜色" description="与应用主题保持一致的六种颜色。" source={colorSource} />
<Demo id="icon/spin" title="旋转动画" description="用 spin 控制持续旋转，适用于加载与刷新状态。" source={spinSource} />
<Demo id="icon/rotate" title="旋转角度" description="通过 rotate 指定静态角度。" source={rotateSource} />
<Demo id="icon/action" title="交互图标" description="用 Button 承载交互，为图标提供可访问名称和键盘操作。" source={actionSource} /></DemoGrid></Section>
  <Section id="api" title="API"><ApiTable rows={api} /></Section>
  <Section id="contracts" title="注意事项"><p>配合 UnoCSS presetIcons、presetUpthrust 和相应 Iconify 集合使用。默认安装 mdi，其他集合需由应用配置。动态名称需要 safelist。spin 动画使用 transform，会覆盖 rotate 的静态角度。onClick 只提供鼠标事件，不自动赋予键盘语义。</p></Section>
</> }
