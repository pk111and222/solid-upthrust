import type { PageMeta } from '../../../routing'
import { ApiTable, CodeBlock, Demo, DemoGrid, Section } from '../../../components/Content'
import basic from '../../../examples/float-button/basic.tsx?raw'
import type_ from '../../../examples/float-button/type.tsx?raw'
import shape from '../../../examples/float-button/shape.tsx?raw'
import content from '../../../examples/float-button/content.tsx?raw'
import tooltip from '../../../examples/float-button/tooltip.tsx?raw'
import group from '../../../examples/float-button/group.tsx?raw'
import groupMenu from '../../../examples/float-button/group-menu.tsx?raw'
import controlled from '../../../examples/float-button/controlled.tsx?raw'
import placement from '../../../examples/float-button/placement.tsx?raw'
import backTop from '../../../examples/float-button/back-top.tsx?raw'
import badge from '../../../examples/float-button/badge.tsx?raw'
import styleClass from '../../../examples/float-button/style-class.tsx?raw'
import floatButtonApi from './float-button-api.json'
import groupApi from './float-button-group-api.json'
import backTopApi from './float-button-back-top-api.json'

export const meta: PageMeta = { title: 'FloatButton 悬浮按钮', description: '悬浮于页面上方的按钮。', group: '组件', order: 112 }
export default function Page() {
  return <>
    <Section id="usage" title="使用方式"><p>用于网站上的全局功能；无论浏览到何处都可以看见的按钮。</p><CodeBlock code={"import { FloatButton, BackTop, FloatButtonGroup } from 'upthrust-ui'\n// 或复合访问：<FloatButton.Group> / <FloatButton.BackTop>"} /></Section>
    <Section id="examples" title="代码演示"><DemoGrid>
      <Demo id="float-button/basic" title="基本" description="最简单的用法。" source={basic} />
      <Demo id="float-button/type" title="类型" description="通过 type 改变悬浮按钮的类型。" source={type_} />
      <Demo id="float-button/shape" title="形状" description="通过 shape 设置不同的形状。" source={shape} />
      <Demo id="float-button/content" title="描述" description="可以通过 content 设置文字内容（仅在 square 形状下推荐使用）。" source={content} />
      <Demo id="float-button/tooltip" title="含有气泡卡片的悬浮按钮" description="设置 tooltip 属性，即可开启气泡卡片。" source={tooltip} />
      <Demo id="float-button/group" title="浮动按钮组" description="按钮组合使用时，推荐 circle 与 square 两种形态。" source={group} minHeight={260} />
      <Demo id="float-button/group-menu" title="菜单模式" description="设置 trigger 属性即可开启菜单模式，提供 click 和 hover 两种触发方式。" source={groupMenu} minHeight={280} />
      <Demo id="float-button/controlled" title="受控模式" description="通过 open 设置组件为受控模式，需要配合 trigger 一起使用。" source={controlled} minHeight={280} />
      <Demo id="float-button/placement" title="弹出方向" description="自定义弹出位置，提供了四个预设值：top、right、bottom、left，默认值为 top。" source={placement} minHeight={320} />
      <Demo id="float-button/back-top" title="回到顶部" description="返回页面顶部的操作按钮。" source={backTop} minHeight={260} />
      <Demo id="float-button/badge" title="徽标数" description="右上角附带圆形徽标数字的悬浮按钮。" source={badge} minHeight={280} />
      <Demo id="float-button/style-class" title="自定义语义结构的样式和类" description="通过 classNames 和 styles 传入对象 / 函数可以自定义 FloatButton 与 Group 的语义化结构样式。" source={styleClass} minHeight={220} />
    </DemoGrid></Section>
    <Section id="float-button-api" title="FloatButton API"><ApiTable rows={floatButtonApi} /></Section>
    <Section id="float-button-group-api" title="FloatButton.Group API"><ApiTable rows={groupApi} /></Section>
    <Section id="float-button-back-top-api" title="FloatButton.BackTop API"><ApiTable rows={backTopApi} /></Section>
    <Section id="limits" title="约定与边界"><p>参考 <a href="https://ant.design/components/float-button-cn/">Ant Design FloatButton 6</a> 源码：按钮为 size=large 的纵向 Button（40 宽、最小 40 高、上下 4px 内边距、2px 间距），单独使用时 fixed 在 right 24 / bottom 48、z-index 1000、boxShadowSecondary；icon-only 图标 18px，content 12px；徽标 translate(50%, -50%)，圆形按钮内缩 r·(√2−1)/√2；Group 圆形为 16px 间距的独立按钮、方形为 Space.Compact（列表带阴影与 8px 圆角）；菜单模式列表距触发按钮 56px，以 0.3s 从 ±40px 位移 + 透明度 0 过渡进出；BackTop 默认 visibilityHeight 400、duration 450ms、easeInOutCubic，淡入淡出 0.2s。</p><p>与 antd 的差异：未处理 RTL；zIndex 不参与 antd 的 useZIndex 叠层上下文（固定 1000，可用 style 覆盖）；ConfigProvider 不下发 floatButton / floatButtonGroup 的 className、backTopIcon 与 closeIcon；Solid 无 cloneElement，tooltip 以按钮本身作为触发节点、不额外包裹；保留 disabled、defaultOpen、direction（废弃）与 BackTop 的 onVisibleChange 扩展。</p></Section>
  </>
}
