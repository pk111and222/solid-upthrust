import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import basic from '../../../examples/tour/basic.tsx?raw'
import nonModal from '../../../examples/tour/non-modal.tsx?raw'
import placement from '../../../examples/tour/placement.tsx?raw'
import mask from '../../../examples/tour/mask.tsx?raw'
import indicator from '../../../examples/tour/indicator.tsx?raw'
import actionsRender from '../../../examples/tour/actions-render.tsx?raw'
import gap from '../../../examples/tour/gap.tsx?raw'
import asyncDemo from '../../../examples/tour/async.tsx?raw'
import styleClass from '../../../examples/tour/style-class.tsx?raw'
import tourApi from './tour-api.json'
import tourStepApi from './tour-step-api.json'

export const meta: PageMeta = { title: 'Tour 漫游式引导', description: '用于分步引导用户了解产品功能的气泡组件。', group: '组件', order: 191 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>常用于引导用户了解产品功能。</p><CodeBlock code={"import { Tour } from 'upthrust-ui'"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="tour/basic" title="基本" description="最简单的用法。" source={basic} />
      <Demo id="tour/non-modal" title="非模态" description="使用 mask={false} 可以将引导变为非模态，同时为了强调引导本身，推荐与 type=&quot;primary&quot; 组合使用。" source={nonModal} />
      <Demo id="tour/placement" title="位置" description="改变引导相对于目标的位置，共有 12 种位置可供选择。当 target={null} 时将会展示在正中央。" source={placement} />
      <Demo id="tour/mask" title="自定义遮罩样式" description="自定义遮罩样式与填充色，步骤级 mask 覆盖 Tour 级。" source={mask} />
      <Demo id="tour/indicator" title="自定义指示器" description="使用 indicatorsRender 自定义指示器。" source={indicator} />
      <Demo id="tour/actions-render" title="自定义操作按钮" description="使用 actionsRender 自定义操作按钮，nextButtonProps / prevButtonProps 改按钮文案。" source={actionsRender} />
      <Demo id="tour/gap" title="自定义高亮区域的样式" description="使用 gap.offset 控制高亮区域与元素之间的间距，gap.radius 控制高亮区域的圆角。" source={gap} />
      <Demo id="tour/async" title="异步校验" description="扩展：beforeChange 返回 Promise，校验期间主按钮 loading，返回 false 否决切换。" source={asyncDemo} />
      <Demo id="tour/style-class" title="自定义语义结构的样式和类" description="通过 classNames 和 styles 传入对象 / 函数可以自定义 Tour 的语义化结构样式。" source={styleClass} />
    </DemoGrid></Section>
    <Section id="tour-api" title="API"><ApiTable rows={tourApi} /></Section>
    <Section id="tour-step-api" title="TourStep"><ApiTable rows={tourStepApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/tour-cn/">Ant Design Tour</a> 6.3.7 与 @rc-component/tour 2.3.0 源码：面板宽 520（max-width fit-content）、8px 圆角（primary 6px）、boxShadowTertiary；关闭按钮 22×22 位于右上 16px；header 16 / 16 / 8 内边距、标题 600 字重；footer 8 / 16 / 16；指示点 6×6、间距 6；按钮 small、间距 8，主按钮 primary（primary 类型下为白底主色字），上一步为 default；遮罩为 SVG mask 镂空高亮区（默认 gap 6、圆角 2，填充 rgba(0,0,0,0.5)），四块透明覆盖矩形拦截点击，未禁用交互时高亮区可操作；打开时锁定 body 滚动；Escape 只关闭最上层（与 Modal / Drawer 共用对话栈），←/→ 切换步骤；从关闭重新打开时回到第 0 步；z-index 1001。</p><p>与 antd 的差异：面板由本库纯函数定位（首选方向溢出更多时翻到对侧、夹在视口 8px 边距内），不支持 builtinPlacements / getPopupContainer / animated / rootClassName；箭头为 8px 旋转方块；按钮文案不跟随 locale；RTL 未处理；保留 beforeChange / maskClosable / showSkip / showIndicators / width 等扩展，footerRender 与 finishText 废弃。</p></Section>
  </>
}
