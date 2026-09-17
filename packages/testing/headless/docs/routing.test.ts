import { describe, expect, it } from 'vitest'
import { createRoutes, fileToRoute, normalizeBase, routeFromPathname, withBase, type PageModule } from '../../../../docs/src/routing'

const page = (title = 'Guide', order = 1): PageModule => ({
  default: () => null,
  meta: { title, description: 'Documentation', group: '研发指南', order },
})
describe('docs.file-routes', () => {
  it.each([
    ['./pages/index.tsx', '/'], ['./pages/guide/index.tsx', '/guide/'],
    ['./pages/components/data-entry/input.tsx', '/components/data-entry/input/'],
  ])('maps %s to physical directory route %s', (file, route) => expect(fileToRoute(file)).toBe(route))
  it.each(['./pages/[slug].tsx', './pages/../secret.tsx', './pages/Button.tsx', './pages/a.test.tsx', './pages/a.ts', 'a.tsx'])('rejects unsafe or non-finite filename %s', file => {
    expect(() => fileToRoute(file)).toThrow('Invalid docs page path')
  })
  it('discovers pages without a handwritten route registry and sorts by metadata', () => {
    const routes = createRoutes({ './pages/components/button.tsx': page('Button', 100), './pages/index.tsx': page('Home', 0) })
    expect(routes.map(({ path }) => path)).toEqual(['/', '/components/button/'])
  })
  it('fails colliding file/index routes', () => {
    expect(() => createRoutes({ './pages/guide.tsx': page(), './pages/guide/index.tsx': page() })).toThrow('Duplicate docs route: /guide/')
  })
  it('fails missing required metadata', () => {
    expect(() => createRoutes({ './pages/guide.tsx': page('') })).toThrow('Invalid docs page metadata')
  })
})
describe('docs.deployment-base', () => {
  it.each([['/', '/'], ['', '/'], ['repo', '/repo/'], ['/repo/', '/repo/'], ['/parent/repo', '/parent/repo/']])('normalizes %s', (input, expected) => {
    expect(normalizeBase(input)).toBe(expected)
  })
  it.each(['https://example.com/', '/../repo', '/repo?x=1', '/%2e%2e/', '/a\\b/'])('rejects an invalid deployment base %s', base => {
    expect(() => normalizeBase(base)).toThrow('DOCS_BASE')
  })
  it('prefixes links including anchors exactly once', () => {
    expect(withBase('/repo/', '/guide/#testing')).toBe('/repo/guide/#testing')
    expect(withBase('/', '/')).toBe('/')
  })
  it('matches deep pages and distinguishes a different repository prefix', () => {
    expect(routeFromPathname('/repo/guide', '/repo/')).toBe('/guide/')
    expect(routeFromPathname('/repo/guide/', '/repo/')).toBe('/guide/')
    expect(routeFromPathname('/repo', '/repo/')).toBe('/')
    expect(routeFromPathname('/repository/guide/', '/repo/')).toBeUndefined()
  })
})
