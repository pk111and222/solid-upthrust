import { lazy, type Component } from 'solid-js'
import type { RouteDefinition } from '@solidjs/router'

const routes: Array<RouteDefinition & {title: string}> = [{
  title: '首页',
  path: '/',
  component: lazy(() => import('./Home.tsx'))
}]

const modules = import.meta.glob('./pages/*.tsx')
const getPromise = async (data) => await data()
for (const path in modules) {
  // 这里怎么写
  const match = path.match(/\.\/pages\/(\w+)\.tsx/);
  if (match) {
    const componentName = match[1]; // 这将提取出"Button"
    routes.push({
      title: componentName,
      path: componentName,
      component: lazy(() => getPromise(modules[path])) as any
    })
  }
}

export default routes
