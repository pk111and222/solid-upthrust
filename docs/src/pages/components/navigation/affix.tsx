import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, Section } from '../../../components/Content'
import api from './affix-api.json'
import basic from '../../../examples/affix/basic.tsx?raw'
import bottom from '../../../examples/affix/bottom.tsx?raw'
import onChange from '../../../examples/affix/on-change.tsx?raw'
import target from '../../../examples/affix/target.tsx?raw'

export const meta: PageMeta = { title: 'Affix 固钉', description: '将页面元素钉在可视范围。', group: '组件', order: 138 }

export default function Page() {
  return <>
    <Section id="usage" title="使用方式">
      <p>从 upthrust-ui 导入 Affix 包住要固定的内容。滚动到阈值后内容固定，原位置保留同尺寸占位，页面不会跳动。</p>
    </Section>
    <Demo id="affix/basic" title="基本" source={basic} />
    <Demo id="affix/bottom" title="固定在底部" source={bottom} />
    <Demo id="affix/on-change" title="固定状态改变的回调" source={onChange} />
    <Demo id="affix/target" title="滚动容器" description="target 指定滚动容器，配合禁用、偏移、内容高度与手动更新。" source={target} />
    <Section id="api" title="AffixProps API"><ApiTable rows={api} /></Section>
    <Section id="contracts" title="契约与边界">
      <p>偏移：都不设置时 offsetTop 为 0。同时设置 offsetTop 与 offsetBottom 时两者都生效：先判断顶部，顶部不满足再判断底部。恰好到达阈值时不固定（严格小于 / 大于）。</p>
      <p>定位：窗口目标用 position: fixed；元素目标在占位块内用 absolute 与相对偏移，因此随容器移动并保留容器的 overflow 裁剪。固定时占位块保留内容高度；内容不迁移到 Portal，子组件不重建。</p>
      <p>测量：监听目标与祖先滚动、窗口缩放，以及占位、内容、目标的 ResizeObserver，并用 requestAnimationFrame 合并；卸载时移除监听。未引起滚动或尺寸变化的外部布局位移请调用 updatePosition()。</p>
      <p>祖先存在 transform / zoom 时 fixed 的坐标系会改变，建议避免在经过变换的祖先下使用。</p>
    </Section>
    <Section id="headless" title="Headless API">
      <p>createAffix(config) 由 upthrust-competence 提供，返回 position()、affixed()、elementTarget()、updatePosition() 与 placeholderRef / contentRef；纯函数 calculateAffix(placeholder, target, config) 给出固定位置（与 antd getFixedTop / getFixedBottom 一致）。</p>
    </Section>
    <Section id="limits" title="暂不支持">
      <p>rootClassName 与语义化 classNames / styles（class 作用于占位外层，affixClass 作用于固定中的内容层）；ConfigProvider 的 getTargetContainer。</p>
    </Section>
  </>
}
