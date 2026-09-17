import { afterEach, describe, expect, it, vi } from 'vitest'
import { mountExamples, type ExampleLoaders } from '../../../../docs/src/islands'

const roots: HTMLElement[] = []
afterEach(() => { roots.splice(0).forEach(root => root.remove()); vi.restoreAllMocks() })
function fixture() {
  const root = document.createElement('main')
  root.innerHTML = '<h1>SSR document</h1><div data-demo="system/example"><p>Loading</p></div><pre><code>&lt;Button /&gt;</code></pre>'
  document.body.append(root); roots.push(root)
  return root
}
describe('docs.client-islands', () => {
  it('mounts only a referenced demo and preserves SSR prose/source identity', async () => {
    const root = fixture(); const heading = root.querySelector('h1'); const code = root.querySelector('code')
    const unused = vi.fn(); const cleanup = vi.fn()
    const loaders: ExampleLoaders = { './examples/system/example.tsx': async () => ({ default: () => null }), './examples/unused.tsx': unused }
    const mount = vi.fn((_component, host: HTMLElement) => { host.textContent = 'Mounted'; return cleanup })
    const islands = mountExamples(root, loaders, mount)
    await islands.ready
    expect(mount).toHaveBeenCalledOnce(); expect(unused).not.toHaveBeenCalled()
    expect(root.querySelector('h1')).toBe(heading); expect(root.querySelector('code')).toBe(code)
    expect(root.querySelector('[data-demo]')?.getAttribute('data-demo-state')).toBe('ready')
    islands.dispose(); islands.dispose(); expect(cleanup).toHaveBeenCalledOnce()
  })
  it('reports load failure without erasing SSR source', async () => {
    const root = fixture(); const error = new Error('Failed chunk'); const report = vi.fn()
    const mount = vi.fn()
    await mountExamples(root, { './examples/system/example.tsx': () => Promise.reject(error) }, mount, report).ready
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('示例加载失败')
    expect(root.querySelector('code')?.textContent).toBe('<Button />')
    expect(report).toHaveBeenCalledWith(error); expect(mount).not.toHaveBeenCalled()
  })
  it('does not mount a late import after disposal', async () => {
    const root = fixture(); let resolve!: (value: { default: () => null }) => void
    const pending = new Promise<{ default: () => null }>(done => { resolve = done })
    const mount = vi.fn(); const islands = mountExamples(root, { './examples/system/example.tsx': () => pending }, mount)
    islands.dispose(); resolve({ default: () => null }); await islands.ready
    expect(mount).not.toHaveBeenCalled()
  })
  it('keeps successful islands usable when another fails', async () => {
    const root = fixture(); const second = document.createElement('div'); second.dataset.demo = 'missing'; root.append(second)
    const mount = vi.fn(() => vi.fn()); const report = vi.fn()
    const islands = mountExamples(root, { './examples/system/example.tsx': async () => ({ default: () => null }) }, mount, report)
    await islands.ready
    expect(mount).toHaveBeenCalledOnce(); expect(second.dataset.demoState).toBe('error')
    islands.dispose()
  })
})
