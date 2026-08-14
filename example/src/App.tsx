import { For, createMemo, type Component } from 'solid-js';
import { Router, RouteSectionProps } from "@solidjs/router";
import routes, { type AppRoute } from './router';

const categoryOrder = ['通用', '布局', '导航', '其他']

const Layout: Component<RouteSectionProps> = (props) => {
  const activeItem = (item) => `/${item.path}` === props.location.pathname

  const grouped = createMemo(() => {
    const groups: Record<string, AppRoute[]> = {}
    for (const route of routes) {
      if (!route.category) continue
      if (!groups[route.category]) groups[route.category] = []
      groups[route.category].push(route)
    }
    return categoryOrder
      .filter(cat => groups[cat]?.length)
      .map(cat => ({ category: cat, items: groups[cat] }))
  })

  const homeRoute = routes.find(r => r.path === '/')

  return <div data-appid='app' class="h-screen flex items-center justify-center bg-white ">
  <div data-appid='menu' class='w-60 h-full overflow-y-auto shadow border-e border-cyan-100 p-t-4'>
    <a href="/" class='m-4 p-l-6 block leading-10 rounded-md bg-blue-50 hover:bg-blue-300 hover:text-white transition-all' classList={{'bg-blue-200': activeItem(homeRoute)}}>首页</a>
    <For each={grouped()}>
      {(group) => (
        <>
          <div class="px-4 pt-4 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">{group.category}</div>
          <For each={group.items}>
            {(item) => (
              <a href={item.path} class='mx-4 p-l-6 block leading-9 rounded-md hover:bg-blue-100 hover:text-blue-600 transition-all text-sm' classList={{'bg-blue-100 text-blue-600 font-medium': activeItem(item)}}>{item.title}</a>
            )}
          </For>
        </>
      )}
    </For>
  </div>
  <div data-appid='content' class='flex-1 h-full overflow-y-auto m-l-8 m-t-8'>
    {props.children}
  </div>
</div>;
}

const App: Component = () => {
  return <Router root={Layout}>{routes}</Router>
};

export default App;
