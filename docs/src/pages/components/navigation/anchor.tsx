import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, Section } from '../../../components/Content'
import api from './anchor-api.json'
import linkApi from './anchor-link-api.json'
import basic from '../../../examples/anchor/basic.tsx?raw'
import horizontal from '../../../examples/anchor/horizontal.tsx?raw'
import staticAnchor from '../../../examples/anchor/static.tsx?raw'
import onClick from '../../../examples/anchor/on-click.tsx?raw'
import customHighlight from '../../../examples/anchor/custom-highlight.tsx?raw'
import onChange from '../../../examples/anchor/on-change.tsx?raw'
import targetOffset from '../../../examples/anchor/target-offset.tsx?raw'
import replace from '../../../examples/anchor/replace.tsx?raw'
import container from '../../../examples/anchor/container.tsx?raw'

export const meta: PageMeta = { title: 'Anchor 锚点', description: '用于跳转到页面指定位置，并随滚动高亮当前区块。', group: '组件', order: 139 }

export default function Page() {
  return <>
    <Section id="usage" title="使用方式">
      <p>从 upthrust-ui 导入 Anchor，用 items 描述链接（href 形如 #section-id）。默认 vertical 并用 Affix 固定；页面滚动时高亮当前区块，点击链接平滑滚动到目标并写入地址栏 hash。</p>
    </Section>
    <Demo id="anchor/basic" title="基本使用" description="默认以窗口为滚动容器，锚点固定在顶部 80px。" source={basic} />
    <Demo id="anchor/horizontal" title="横向锚点" source={horizontal} />
    <Demo id="anchor/static" title="静态位置" description="affix={false}，嵌套链接。" source={staticAnchor} />
    <Demo id="anchor/on-click" title="自定义 onClick" source={onClick} />
    <Demo id="anchor/custom-highlight" title="自定义锚点高亮" source={customHighlight} />
    <Demo id="anchor/on-change" title="监听锚点链接改变" source={onChange} />
    <Demo id="anchor/target-offset" title="设置锚点滚动偏移量" source={targetOffset} />
    <Demo id="anchor/replace" title="替换历史中的 href" source={replace} />
    <Demo id="anchor/container" title="自定义滚动容器" description="getContainer 返回内部可滚动元素。" source={container} />
    <Section id="api" title="AnchorProps API"><ApiTable rows={api} /></Section>
    <Section id="link-api" title="AnchorLinkItemProps"><ApiTable rows={linkApi} /></Section>
    <Section id="contracts" title="契约与边界">
      <p>高亮判定：按文档顺序取最后一个顶边不低于 scrollTop + targetOffset + bounds 的区块；向上滚动会恢复更早的区块。找不到目标元素的链接会被跳过。</p>
      <p>点击链接：先回调 onClick，再平滑滚动并立即高亮被点击的链接；滚动期间忽略 scroll-spy，直到滚动静止 120ms 后恢复（且不回算，最后一个短区块也保持高亮）。未被 preventDefault 时用 pushState（replace 时 replaceState）写入 hash；http(s):// 外链不拦截。</p>
      <p>onChange 参数为 href（经过 getCurrentAnchor 之后），只在高亮真正变化时触发；无高亮时为空字符串。getCurrentAnchor 返回 href，为兼容旧用法也接受 key。</p>
      <p>ink 指示条：vertical 贴左侧 2px 轨道，top / height 跟随激活标题；horizontal 贴底，left / width 跟随激活标题。vertical 在 affix={'{false}'} 时默认隐藏 ink，可用 showInkInFixed 打开。</p>
    </Section>
    <Section id="headless" title="Headless API">
      <p>createAnchor(config) 由 upthrust-competence 提供：双向 scroll-spy、点击滚动抑制窗口（ANCHOR_SCROLL_SETTLE = 120ms）、可注入的 getScrollContainer / requestAnimationFrame / setTimeout。返回 activeKey()、scrollTo(key)。anchorTargetId(href) 取 href 最后一个 # 之后的目标 id。</p>
    </Section>
    <Section id="limits" title="暂不支持">
      <p>语义化 classNames / styles；RTL 方向；ConfigProvider 的 anchor 全局配置；Anchor.Link JSX 子组件写法（请用 items）。</p>
    </Section>
  </>
}
