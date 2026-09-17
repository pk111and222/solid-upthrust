import type { Component } from 'solid-js'

type ExampleModule = { default: Component }
export type ExampleLoaders = Record<string, () => Promise<ExampleModule>>
export type MountExample = (component: Component, host: HTMLElement) => () => void

/** SSR content is never hydrated/replaced; each demo owns only its mount target. */
export function mountExamples(root: ParentNode, loaders: ExampleLoaders, mount: MountExample, report = console.error) {
  let disposed = false
  const disposers: (() => void)[] = []
  const ready = Promise.all(Array.from(root.querySelectorAll<HTMLElement>('[data-demo]')).map(async host => {
    const id = host.dataset.demo
    try {
      const load = id && loaders[`./examples/${id}.tsx`]
      if (!load) throw new Error(`Unknown client example: ${id}`)
      const module = await load()
      if (disposed) return
      host.replaceChildren()
      disposers.push(mount(module.default, host))
      host.dataset.demoState = 'ready'
    } catch (error) {
      if (disposed) return
      const message = document.createElement('p')
      message.setAttribute('role', 'alert')
      message.textContent = '示例加载失败，请刷新重试；下方源码仍可阅读。'
      host.replaceChildren(message)
      host.dataset.demoState = 'error'
      report(error)
    }
  }))
  return { ready, dispose() { if (disposed) return; disposed = true; disposers.forEach(dispose => dispose()) } }
}
