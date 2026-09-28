import type { Component } from 'solid-js'
import Basic from '../../../docs/src/examples/breadcrumb/basic'
import WithIcon from '../../../docs/src/examples/breadcrumb/with-icon'
import Params from '../../../docs/src/examples/breadcrumb/params'
import Separator from '../../../docs/src/examples/breadcrumb/separator'
import SeparatorComponent from '../../../docs/src/examples/breadcrumb/separator-component'
import Overlay from '../../../docs/src/examples/breadcrumb/overlay'
import ItemRender from '../../../docs/src/examples/breadcrumb/item-render'
import StyleClass from '../../../docs/src/examples/breadcrumb/style-class'

const BreadcrumbPage: Component = () => (
  <div class="p-6 max-w-5xl flex flex-col gap-8">
    <div>
      <h2 class="text-2xl font-bold mb-2">Breadcrumb 面包屑</h2>
      <p class="text-on-surface-variant">显示当前页面在系统层级结构中的位置，并能向上返回。</p>
    </div>
    <section data-breadcrumb-demo="basic"><h3 class="text-lg font-semibold mb-3">基本</h3><Basic /></section>
    <section data-breadcrumb-demo="with-icon"><h3 class="text-lg font-semibold mb-3">带图标</h3><WithIcon /></section>
    <section data-breadcrumb-demo="params"><h3 class="text-lg font-semibold mb-3">带参数</h3><Params /></section>
    <section data-breadcrumb-demo="separator"><h3 class="text-lg font-semibold mb-3">分隔符</h3><Separator /></section>
    <section data-breadcrumb-demo="separator-component"><h3 class="text-lg font-semibold mb-3">独立分隔符</h3><SeparatorComponent /></section>
    <section data-breadcrumb-demo="overlay"><h3 class="text-lg font-semibold mb-3">带下拉菜单</h3><Overlay /></section>
    <section data-breadcrumb-demo="item-render"><h3 class="text-lg font-semibold mb-3">自定义渲染</h3><ItemRender /></section>
    <section data-breadcrumb-demo="style-class"><h3 class="text-lg font-semibold mb-3">语义化 classNames / styles</h3><StyleClass /></section>
  </div>
)

export default BreadcrumbPage
