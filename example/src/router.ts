import { lazy, type Component } from 'solid-js'
import type { RouteDefinition } from '@solidjs/router'

export type AppRoute = RouteDefinition & { title: string; category?: string }

const categoryMap: Record<string, string> = {
  Button: '通用',
  Icon: '通用',
  Typography: '通用',
  Divider: '布局',
  Flex: '布局',
  Grid: '布局',
  LayoutDemo: '布局',
  Masonry: '布局',
  Space: '布局',
  Splitter: '布局',
  Anchor: '导航',
  Breadcrumb: '导航',
  Dropdown: '导航',
  Menu: '导航',
  Pagination: '导航',
  Steps: '导航',
  Tabs: '导航',
}

const routes: AppRoute[] = [{
  title: '首页',
  path: '/',
  component: lazy(() => import('./Home.tsx'))
}]

const modules = import.meta.glob('./pages/*.tsx')
const getPromise = async (data) => await data()
for (const path in modules) {
  const match = path.match(/\.\/pages\/(\w+)\.tsx/);
  if (match) {
    const componentName = match[1];
    routes.push({
      title: componentName,
      path: componentName,
      category: categoryMap[componentName] || '其他',
      component: lazy(() => getPromise(modules[path])) as any
    })
  }
}

export default routes
