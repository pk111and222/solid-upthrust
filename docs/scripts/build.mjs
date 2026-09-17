import { build } from 'vite'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const configFile = resolve(root, 'vite.config.ts')
const out = resolve(root, 'dist')
const siteUrl = process.env.DOCS_SITE_URL
if (siteUrl) {
  const url = new URL(siteUrl)
  if (!['https:', 'http:'].includes(url.protocol) || url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    throw new Error('DOCS_SITE_URL must be an origin (e.g. https://example.github.io); set its path using DOCS_BASE.')
  }
}
let base
await build({ configFile, plugins: [{ name: 'capture-docs-base', configResolved(config) { base = config.base } }], build: {
  outDir: out, emptyOutDir: true, manifest: true,
  rollupOptions: { input: resolve(root, 'src/entry-client.ts') },
} })
await build({ configFile, build: {
  ssr: resolve(root, 'src/entry-server.tsx'), outDir: resolve(root, '.ssr'),
  emptyOutDir: true, copyPublicDir: false, manifest: false,
} })
const { renderPage, routes } = await import(pathToFileURL(resolve(root, '.ssr/entry-server.js')).href)
const manifest = JSON.parse(await readFile(resolve(out, '.vite/manifest.json'), 'utf8'))
const entry = manifest['src/entry-client.ts']
if (!entry?.file) throw new Error('Missing docs client entry in Vite manifest')
// Include generated theme CSS in the initial HTML, even before client JS runs.
const css = [...new Set(Object.values(manifest).flatMap(chunk => chunk.css ?? []))]
const options = { base, scripts: [base + entry.file], styles: css.map(file => base + file), siteUrl }
for (const route of routes) {
  const file = resolve(out, route.path.slice(1), 'index.html')
  await mkdir(dirname(file), { recursive: true })
  const result = renderPage(route.path, options)
  if (result.status !== 200) throw new Error(`Failed to prerender ${route.path}`)
  await writeFile(file, result.html)
}
await writeFile(resolve(out, '404.html'), renderPage('/404/', options).html)
await writeFile(resolve(out, '.nojekyll'), '')
await writeFile(resolve(out, 'routes.json'), JSON.stringify({ base, routes: routes.map(({ path, meta }) => ({ path, ...meta })) }, null, 2))
if (siteUrl) {
  const xmlEscape = value => value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char])
  const locations = routes.map(route => `<url><loc>${xmlEscape(new URL(base + route.path.slice(1), siteUrl).href)}</loc></url>`).join('')
  await writeFile(resolve(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${locations}</urlset>`)
}
console.log(`Prerendered ${routes.length} documentation pages to docs/dist (base: ${base}).`)
