import { lazy } from 'solid-js'
import type { RouteDefinition } from '@solidjs/router'

export type AppRoute = Omit<RouteDefinition, 'component'> & {
  title: string
  category?: string
  component: NonNullable<RouteDefinition['component']>
}

const categoryMap: Record<string, string> = {
  Button: '通用',
  Icon: '通用',
  Typography: '通用',
  Divider: '布局',
  Flex: '布局',
  Grid: '布局',
  Layout: '布局',
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
  Avatar: '数据展示',
  Badge: '数据展示',
  Empty: '数据展示',
  Popover: '数据展示',
  QRCode: '数据展示',
  Statistic: '数据展示',
  Timeline: '数据展示',
  Tooltip: '数据展示',
  Popconfirm: '反馈',
  Alert: '反馈',
  Message: '反馈',
  Notification: '反馈',
  Progress: '反馈',
  Result: '反馈',
  Skeleton: '反馈',
  Spin: '反馈',
  Watermark: '反馈',
  Modal: '反馈',
  Drawer: '反馈',
  Carousel: '数据展示',
  Collapse: '数据展示',
  Image: '数据展示',
  List: '数据展示',
  Descriptions: '数据展示',
  Calendar: '数据展示',
  Card: '数据展示',
}

const routes: AppRoute[] = [{
  title: '首页',
  path: '/',
  component: lazy(() => import('./Home.tsx'))
}]

const modules = import.meta.glob<{ default: AppRoute['component'] }>('./pages/*.tsx')
for (const [path, load] of Object.entries(modules)) {
  const match = path.match(/\.\/pages\/(\w+)\.tsx/);
  if (match) {
    const componentName = match[1];
    routes.push({
      title: componentName,
      path: componentName,
      category: categoryMap[componentName] || '其他',
      component: lazy(load)
    })
  }
}

export default routes
