import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../dist', import.meta.url))
const { base } = JSON.parse(await readFile(resolve(root, 'routes.json'), 'utf8'))
const port = Number(process.env.DOCS_PORT ?? 4173)
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.xml': 'application/xml; charset=utf-8', '.woff2': 'font/woff2' }
// Deliberately no SPA fallback: this exercises the same directory URLs as Pages.
const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return }
  try {
    const url = new URL(request.url ?? '/', 'http://localhost')
    const pathname = decodeURIComponent(url.pathname)
    if (pathname === base.slice(0, -1) && base !== '/') {
      response.writeHead(308, { Location: `${base}${url.search}` }); response.end(); return
    }
    if (!pathname.startsWith(base)) throw new Error('Outside deployment base')
    let file = resolve(root, pathname.slice(base.length))
    if (file !== root && !file.startsWith(root + sep)) throw new Error('Outside output directory')
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith('/')) { response.writeHead(308, { Location: `${url.pathname}/${url.search}` }); response.end(); return }
      file = resolve(file, 'index.html')
    }
    const content = await readFile(file)
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' })
    response.end(request.method === 'HEAD' ? undefined : content)
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    response.end(request.method === 'HEAD' ? undefined : await readFile(resolve(root, '404.html')))
  }
})
server.listen(port, '127.0.0.1', () => console.log(`Docs preview: http://127.0.0.1:${port}${base}`))
