import type { Component } from 'solid-js'
import Horizontal from '../../../docs/src/examples/menu/horizontal'
import HorizontalDark from '../../../docs/src/examples/menu/horizontal-dark'
import Inline from '../../../docs/src/examples/menu/inline'
import InlineCollapsed from '../../../docs/src/examples/menu/inline-collapsed'
import TooltipDemo from '../../../docs/src/examples/menu/tooltip'
import SiderCurrent from '../../../docs/src/examples/menu/sider-current'
import Vertical from '../../../docs/src/examples/menu/vertical'
import Theme from '../../../docs/src/examples/menu/theme'
import SubmenuTheme from '../../../docs/src/examples/menu/submenu-theme'
import SwitchMode from '../../../docs/src/examples/menu/switch-mode'
import StyleClass from '../../../docs/src/examples/menu/style-class'
import CustomPopupRender from '../../../docs/src/examples/menu/custom-popup-render'
import Extra from '../../../docs/src/examples/menu/extra'
import RenderLabel from '../../../docs/src/examples/menu/render-label'
import Multiple from '../../../docs/src/examples/menu/multiple'

const MenuPage: Component = () => (
  <div class="p-6 max-w-5xl flex flex-col gap-8">
    <div>
      <h2 class="text-2xl font-bold mb-2">Menu 导航菜单</h2>
      <p class="text-on-surface-variant">为页面和功能提供导航的菜单列表。</p>
    </div>
    <section data-menu-demo="horizontal"><h3 class="text-lg font-semibold mb-3">顶部导航</h3><Horizontal /></section>
    <section data-menu-demo="horizontal-dark"><h3 class="text-lg font-semibold mb-3">顶部导航（深色）</h3><HorizontalDark /></section>
    <section data-menu-demo="inline"><h3 class="text-lg font-semibold mb-3">内嵌菜单</h3><Inline /></section>
    <section data-menu-demo="inline-collapsed"><h3 class="text-lg font-semibold mb-3">缩起内嵌菜单</h3><InlineCollapsed /></section>
    <section data-menu-demo="tooltip"><h3 class="text-lg font-semibold mb-3">菜单项提示</h3><TooltipDemo /></section>
    <section data-menu-demo="sider-current"><h3 class="text-lg font-semibold mb-3">只展开当前父级菜单</h3><SiderCurrent /></section>
    <section data-menu-demo="vertical"><h3 class="text-lg font-semibold mb-3">垂直菜单</h3><Vertical /></section>
    <section data-menu-demo="theme"><h3 class="text-lg font-semibold mb-3">主题</h3><Theme /></section>
    <section data-menu-demo="submenu-theme"><h3 class="text-lg font-semibold mb-3">子菜单主题</h3><SubmenuTheme /></section>
    <section data-menu-demo="switch-mode"><h3 class="text-lg font-semibold mb-3">切换菜单类型</h3><SwitchMode /></section>
    <section data-menu-demo="style-class"><h3 class="text-lg font-semibold mb-3">语义化 classNames / styles</h3><StyleClass /></section>
    <section data-menu-demo="custom-popup-render"><h3 class="text-lg font-semibold mb-3">自定义弹层</h3><CustomPopupRender /></section>
    <section data-menu-demo="extra"><h3 class="text-lg font-semibold mb-3">附加内容、危险与禁用</h3><Extra /></section>
    <section data-menu-demo="render-label"><h3 class="text-lg font-semibold mb-3">原生链接标签</h3><RenderLabel /></section>
    <section data-menu-demo="multiple"><h3 class="text-lg font-semibold mb-3">多选与点击触发</h3><Multiple /></section>
  </div>
)

export default MenuPage
