import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, Section } from '../../../components/Content'
import api from './menu-api.json'
import itemApi from './menu-item-api.json'
import horizontal from '../../../examples/menu/horizontal.tsx?raw'
import horizontalDark from '../../../examples/menu/horizontal-dark.tsx?raw'
import inline from '../../../examples/menu/inline.tsx?raw'
import inlineCollapsed from '../../../examples/menu/inline-collapsed.tsx?raw'
import tooltip from '../../../examples/menu/tooltip.tsx?raw'
import siderCurrent from '../../../examples/menu/sider-current.tsx?raw'
import vertical from '../../../examples/menu/vertical.tsx?raw'
import theme from '../../../examples/menu/theme.tsx?raw'
import submenuTheme from '../../../examples/menu/submenu-theme.tsx?raw'
import switchMode from '../../../examples/menu/switch-mode.tsx?raw'
import styleClass from '../../../examples/menu/style-class.tsx?raw'
import customPopupRender from '../../../examples/menu/custom-popup-render.tsx?raw'
import extra from '../../../examples/menu/extra.tsx?raw'
import renderLabel from '../../../examples/menu/render-label.tsx?raw'
import multiple from '../../../examples/menu/multiple.tsx?raw'

export const meta: PageMeta = { title: 'Menu 导航菜单', description: '为页面和功能提供导航的菜单列表。', group: '组件', order: 145 }

export default function Page() {
  return <>
    <Section id="usage" title="使用方式">
      <p>从 upthrust-ui 导入 Menu，用 items 数据描述菜单：有 children 的是子菜单，type: 'group' 为分组，type: 'divider' 为分割线。三种模式：vertical（默认，子菜单右侧弹出）、horizontal（顶部导航，子菜单下方弹出）、inline（内嵌展开）。</p>
    </Section>
    <Demo id="menu/horizontal" title="顶部导航" source={horizontal} />
    <Demo id="menu/horizontal-dark" title="顶部导航（深色）" source={horizontalDark} />
    <Demo id="menu/inline" title="内嵌菜单" source={inline} />
    <Demo id="menu/inline-collapsed" title="缩起内嵌菜单" source={inlineCollapsed} />
    <Demo id="menu/tooltip" title="菜单项提示" source={tooltip} />
    <Demo id="menu/sider-current" title="只展开当前父级菜单" source={siderCurrent} />
    <Demo id="menu/vertical" title="垂直菜单" source={vertical} />
    <Demo id="menu/theme" title="主题" source={theme} />
    <Demo id="menu/submenu-theme" title="子菜单主题" source={submenuTheme} />
    <Demo id="menu/switch-mode" title="切换菜单类型" source={switchMode} />
    <Demo id="menu/style-class" title="语义化 classNames / styles" source={styleClass} />
    <Demo id="menu/custom-popup-render" title="自定义弹层" source={customPopupRender} />
    <Demo id="menu/extra" title="附加内容、危险与禁用" source={extra} />
    <Demo id="menu/render-label" title="原生链接标签" source={renderLabel} />
    <Demo id="menu/multiple" title="多选与点击触发" source={multiple} />
    <Section id="api" title="MenuProps API"><ApiTable rows={api} /></Section>
    <Section id="item-api" title="MenuItemType"><ApiTable rows={itemApi} /></Section>
    <Section id="contracts" title="状态与边界">
      <p>选中与展开各自受控：传入 selectedKeys / openKeys 时由父层应用回调。onClick 先于 onSelect / onDeselect；单选时点击菜单项会关闭所有弹层（inline 除外），无论是否 selectable。非 inline 模式关闭子菜单时连带关闭其下级弹层。</p>
      <p>inline 与 vertical 在 inlineCollapsed（或所在 Sider 收起）时切成收起的 vertical 模式：宽 80px、只显示图标，无图标的一级字符串标签显示首字符，一级项悬浮时显示提示。收起或切出 inline 会清空展开项并触发 onOpenChange；回到 inline 时恢复之前的展开项。</p>
      <p>inline 缩进为 层级 × inlineIndent（分组不计层级）。水平菜单一级弹层最小宽度与标题同宽。子菜单弹层主题默认跟随 Menu，子菜单 theme 可单独指定。</p>
    </Section>
    <Section id="keyboard" title="键盘与可访问性">
      <p>根节点 role="menu" 可聚焦；菜单项与子菜单标题为 role="menuitem"，子菜单标题带 aria-expanded / aria-haspopup / aria-controls，选中项带 aria-selected。方向键在同级移动（inline 为整棵可见树），Home / End 到首尾；vertical 与弹层中 → / Enter 打开子菜单并聚焦第一项，← / Esc 关闭并回到标题；horizontal 一级 ↓ / Enter 打开。inline 中 Enter 切换子菜单。收起的 inline 子树与隐藏弹层设为 inert，不进入 Tab 序列。</p>
    </Section>
    <Section id="headless" title="Headless API">
      <p>createMenu(config) 由 upthrust-competence 提供：key 路径注册表、选中 / 展开状态机、模式派生与 inline 展开项缓存、基于 DOM 标记（data-menu-owner / data-menu-key / data-menu-list）的键盘导航。返回 nodes()、mode()、inlineCollapsed()、selectedKeys()、openKeys()、isSelected / isChildSelected / isOpen、click / titleClick / openChange / onKeyDown / focus。</p>
    </Section>
    <Section id="limits" title="暂不支持">
      <p>水平菜单的溢出折叠（overflowedIndicator）；RTL 方向；ConfigProvider 的 menu 全局配置；Menu.Item 等 JSX 子组件写法（请用 items）。</p>
    </Section>
  </>
}
