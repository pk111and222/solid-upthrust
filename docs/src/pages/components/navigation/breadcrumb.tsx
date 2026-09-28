import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, Section } from '../../../components/Content'
import api from './breadcrumb-api.json'
import itemApi from './breadcrumb-item-api.json'
import menuItemApi from './breadcrumb-menu-item-api.json'
import basic from '../../../examples/breadcrumb/basic.tsx?raw'
import withIcon from '../../../examples/breadcrumb/with-icon.tsx?raw'
import params from '../../../examples/breadcrumb/params.tsx?raw'
import separator from '../../../examples/breadcrumb/separator.tsx?raw'
import separatorComponent from '../../../examples/breadcrumb/separator-component.tsx?raw'
import overlay from '../../../examples/breadcrumb/overlay.tsx?raw'
import itemRender from '../../../examples/breadcrumb/item-render.tsx?raw'
import styleClass from '../../../examples/breadcrumb/style-class.tsx?raw'

export const meta: PageMeta = { title: 'Breadcrumb 面包屑', description: '显示当前页面在系统层级结构中的位置，并能向上返回。', group: '组件', order: 142 }

export default function Page() {
  return <>
    <Section id="usage" title="使用方式">
      <p>从 upthrust-ui 导入 Breadcrumb，用 items 描述路由栈。有 href 的项渲染为链接 a，其余为 span；最后一项文字颜色加深。旧的 Breadcrumb.Item 子元素写法仍然可用。</p>
    </Section>
    <Demo id="breadcrumb/basic" title="基本" source={basic} />
    <Demo id="breadcrumb/with-icon" title="带图标" source={withIcon} />
    <Demo id="breadcrumb/params" title="带参数" source={params} />
    <Demo id="breadcrumb/separator" title="分隔符" source={separator} />
    <Demo id="breadcrumb/separator-component" title="独立分隔符" source={separatorComponent} />
    <Demo id="breadcrumb/overlay" title="带下拉菜单" source={overlay} />
    <Demo id="breadcrumb/item-render" title="自定义渲染" source={itemRender} />
    <Demo id="breadcrumb/style-class" title="语义化 classNames / styles" source={styleClass} />
    <Section id="api" title="BreadcrumbProps API"><ApiTable rows={api} /></Section>
    <Section id="item-api" title="ItemType"><ApiTable rows={itemApi} /></Section>
    <Section id="menu-item-api" title="BreadcrumbMenuItem"><ApiTable rows={menuItemApi} /></Section>
    <Section id="contracts" title="结构与边界">
      <p>结构为 nav[aria-label="breadcrumb"] &gt; ol &gt; li：分隔符是独立的 li[aria-hidden="true"]，最后一项之后不渲染分隔符。颜色：普通项与分隔符为 on-surface/45，最后一项为 on-surface；链接 hover 文字加深并显示浅灰背景，最后一项若带 href 仍保持链接色。</p>
      <p>path 规则：带 path 的项依次累积 paths，href 被覆盖为 #/paths.join('/')；path 开头的 / 会被去掉。params 替换 path 与字符串 title 中的 :name，未知参数原样保留；JSX title 不做替换。itemRender 的 paths 为该项及之前累积的路径。</p>
      <p>menu 项默认悬浮打开、placement 为 bottom，可通过 dropdownProps 改为点击或受控。菜单项 title 是 label 的别名；带 path 时渲染为 &lt;a href={'{item.href + path}'}&gt;。菜单点击先调用菜单项 onClick，再调用 menu.onClick(key)，然后关闭。</p>
      <p>separator 为 '' 或 null 时不再自动插入分隔符，可用 type: 'separator' 的项手动放置。title 为 null / undefined 的项（及其后的分隔符）不渲染。</p>
    </Section>
    <Section id="limits" title="暂不支持">
      <p>ConfigProvider 的 breadcrumb 全局配置；RTL 方向；Breadcrumb.Separator 子组件（请用 type: 'separator'）；routes 旧属性（请用 items）；menu 的完整 Menu 属性（仅支持 items / onClick）。</p>
    </Section>
  </>
}
