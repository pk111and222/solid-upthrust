import { For, createMemo, Loading, type Component } from 'solid-js';
import { createRouter, useLocation } from "@solidjs/router";
import routes, { type AppRoute } from './router';
import { MessageProvider, NotificationProvider } from 'upthrust-ui';

const categoryOrder = ['通用', '布局', '导航', '数据展示', '反馈', '其他']

const Router = createRouter({ routes })

const Layout: Component<{ children?: any }> = (props) => {
  const location = useLocation()
  const activeItem = (item: AppRoute | undefined) => item !== undefined && `/${item.path}` === location.pathname

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
    <a href="/" class={['m-4 p-l-6 block leading-10 rounded-md bg-blue-50 hover:bg-blue-300 hover:text-white transition-all', activeItem(homeRoute) && 'bg-blue-200']}>首页</a>
    <For each={grouped()}>
      {(group) => (
        <>
          <div class="px-4 pt-4 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">{group.category}</div>
          <For each={group.items}>
            {(item) => (
              <a href={item.path} class={['mx-4 p-l-6 block leading-9 rounded-md hover:bg-blue-100 hover:text-blue-600 transition-all text-sm', activeItem(item) && 'bg-blue-100 text-blue-600 font-medium']}>{item.title}</a>
            )}
          </For>
        </>
      )}
    </For>
  </div>
  <div data-appid='content' class='flex-1 h-full overflow-y-auto m-l-8 m-t-8'>
    <Loading fallback={<div class="p-6 text-sm text-on-surface-variant">加载中…</div>}>
      {props.children}
    </Loading>
  </div>
</div>;
}

const App: Component = () => {
  return (
    <>
      <MessageProvider />
      <NotificationProvider />
      <Router>{(props) => <Layout>{props.children}</Layout>}</Router>
    </>
  )
};

export default App;
