import type { Component } from 'solid-js'

export interface PageMeta {
  title: string
  description: string
  group: '开始使用' | '研发指南' | '组件'
  order: number
}
export interface PageModule { default: Component; meta: PageMeta }
export interface DocRoute { path: string; component: Component; meta: PageMeta }

/** A finite file route has one physical HTML file, not a SPA fallback. */
export function fileToRoute(file: string): string {
  const relative = /^\.\/pages\/(.+)\.tsx$/.exec(file)?.[1]
  if (!relative || !relative.split('/').every(part => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(part))) {
    throw new Error(`Invalid docs page path: ${file}. Use lowercase kebab-case .tsx files.`)
  }
  const parts = relative.split('/')
  if (parts.at(-1) === 'index') parts.pop()
  return parts.length ? `/${parts.join('/')}/` : '/'
}

export function createRoutes(modules: Record<string, PageModule>): DocRoute[] {
  const seen = new Set<string>()
  return Object.entries(modules).map(([file, module]) => {
    const path = fileToRoute(file)
    if (seen.has(path)) throw new Error(`Duplicate docs route: ${path}`)
    seen.add(path)
    const meta = module.meta
    if (typeof module.default !== 'function' || !meta?.title?.trim() || !meta.description?.trim()
      || !['开始使用', '研发指南', '组件'].includes(meta.group) || !Number.isFinite(meta.order)) {
      throw new Error(`Invalid docs page metadata/component: ${file}`)
    }
    return { path, component: module.default, meta }
  }).sort((a, b) => a.meta.order - b.meta.order || a.path.localeCompare(b.path))
}

export function normalizeBase(input = '/'): string {
  const parts = input.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
  if (!parts.every(part => /^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/.test(part))) {
    throw new Error('DOCS_BASE must be a pathname, e.g. /solid-upthrust/ (not a URL).')
  }
  return parts.length ? `/${parts.join('/')}/` : '/'
}

export function withBase(base: string, path: string): string {
  return `${normalizeBase(base)}${path.replace(/^\//, '')}`
}

export function routeFromPathname(pathname: string, base: string): string | undefined {
  const prefix = normalizeBase(base)
  if (pathname === prefix.slice(0, -1)) return '/'
  if (!pathname.startsWith(prefix)) return undefined
  const path = `/${pathname.slice(prefix.length)}`
  return path.endsWith('/') ? path : `${path}/`
}
