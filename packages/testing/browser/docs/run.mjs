import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../../../../', import.meta.url))
function run(args, env) {
  const result = spawnSync('pnpm', args, { cwd: root, env, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
run(['--dir', 'packages/testing', 'run', 'typecheck:browser'], process.env)
// Exercise both a domain root and a GitHub Pages project path, not an SPA dev server.
for (const base of ['/', '/solid-upthrust/']) {
  const env = { ...process.env, DOCS_BASE: base }
  run(['run', 'build:docs'], env)
  run(['--dir', 'packages/testing', 'exec', 'playwright', 'test', '--config', 'playwright.docs.config.ts'], env)
}
