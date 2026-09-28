import Breadcrumb, { type BreadcrumbItemRender, type BreadcrumbItemType } from 'upthrust-ui/source/Breadcrumb'

const items: BreadcrumbItemType[] = [
  { title: '首页', path: 'home' },
  { title: '列表', path: 'list' },
  { title: '详情', path: 'detail' },
]

export default function ItemRender() {
  // 最后一项渲染为纯文本，其余渲染为带路由路径的链接（paths 为累积路径）。
  const itemRender: BreadcrumbItemRender = (route, _params, routes, paths) =>
    routes.indexOf(route) === routes.length - 1
      ? <span data-item-render="last">{route.title}</span>
      : <a href={`#/${paths.join('/')}`}>{route.title}</a>
  return (
    <div class="flex flex-col gap-3">
      <Breadcrumb items={items} itemRender={itemRender} />
      <output class="text-[12px] text-on-surface/45">itemRender(route, params, routes, paths)</output>
    </div>
  )
}
