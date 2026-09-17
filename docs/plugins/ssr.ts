import type { Plugin } from 'vite'
import { normalizeBase, routeFromPathname, withBase } from '../src/routing.ts'
import type { renderPage as renderPageType } from '../src/entry-server.tsx'

/** Development-only HTTP adapter. Production emits files, not a Node server. */
export function docsSsr(): Plugin {
  let base = '/'
  return {
    name: 'upthrust-docs-ssr',
    configResolved(config) { base = normalizeBase(config.base) },
    configureServer(server) {
      return () => {
        server.middlewares.use(async (request, response, next) => {
          if (request.method !== 'GET' && request.method !== 'HEAD') return next()
          const url = new URL(request.originalUrl ?? request.url ?? '/', 'http://localhost')
          // Vite owns module, asset and CSS requests.
          if (/\.[a-z0-9]+$/i.test(url.pathname)) return next()
          const path = routeFromPathname(url.pathname, base)
          if (path === undefined) { response.statusCode = 404; response.end('Not found'); return }
          try {
            const { renderPage } = await server.ssrLoadModule('/src/entry-server.tsx') as { renderPage: typeof renderPageType }
            // The document already owns base-prefixed URLs. Inject Vite's client
            // explicitly instead of transformIndexHtml prefixing them a second time.
            const result = renderPage(path, { base, scripts: [withBase(base, '/@vite/client'), withBase(base, '/src/entry-client.ts')] })
            if (result.status === 200 && !url.pathname.endsWith('/')) {
              response.writeHead(308, { Location: `${withBase(base, path)}${url.search}` }); response.end(); return
            }
            response.writeHead(result.status, { 'Content-Type': 'text/html; charset=utf-8' })
            response.end(request.method === 'HEAD' ? undefined : result.html)
          } catch (error) {
            if (error instanceof Error) server.ssrFixStacktrace(error)
            next(error)
          }
        })
      }
    },
    hotUpdate({ server }) {
      // Include create/delete events: otherwise a removed page can survive in
      // ssrLoadModule's cached eager glob. The small site deliberately reloads.
      server.environments.ssr.moduleGraph.invalidateAll()
      this.environment.moduleGraph.invalidateAll()
      if (this.environment.name === 'client') server.ws.send({ type: 'full-reload' })
      return []
    },
  }
}
