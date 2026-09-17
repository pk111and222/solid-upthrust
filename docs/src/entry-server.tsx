import { renderToString } from '@solidjs/web'
import { Document } from './components/Document'
import { DocLink } from './components/Content'
import { SiteContext } from './context'
import { createRoutes, normalizeBase, withBase, type PageModule } from './routing'

// Pages are server-only. Demo components must be referenced by ID + ?raw source,
// never imported as executable code into this eager module graph.
export const routes = createRoutes(import.meta.glob<PageModule>('./pages/**/*.tsx', { eager: true }))
const exampleIds = new Set(Object.keys(import.meta.glob('./examples/**/*.tsx', { query: '?raw', import: 'default' }))
  .map(file => file.replace('./examples/', '').replace(/\.tsx$/, '')))

export interface RenderOptions { base?: string; scripts?: string[]; styles?: string[]; siteUrl?: string }
export function renderPage(path: string, options: RenderOptions = {}) {
  const base = normalizeBase(options.base)
  const route = routes.find(route => route.path === path)
  const Content = route?.component ?? (() => <p>页面不存在。<DocLink href="/">返回文档首页</DocLink></p>)
  const title = route?.meta.title ?? '页面未找到'
  const description = route?.meta.description ?? '请求的文档页面不存在，请通过目录查找内容。'
  const html = '<!doctype html>' + renderToString(() =>
    <SiteContext value={{ base, path, routes }}>
      <Document title={title} description={description} path={path} base={base} routes={routes}
        scripts={options.scripts ?? []} styles={options.styles ?? []} notFound={!route}
        canonical={route && options.siteUrl ? new URL(withBase(base, path), options.siteUrl).href : undefined}>
        <Content />
      </Document>
    </SiteContext>, { noScripts: true, onError: error => { throw error } })
  // Fail broken island references during build, instead of showing a silent blank example.
  for (const [, id] of html.matchAll(/data-demo="([^"]+)"/g)) {
    if (!exampleIds.has(id)) throw new Error(`Unknown client example "${id}" in ${path}`)
  }
  return { html, status: route ? 200 : 404 }
}
