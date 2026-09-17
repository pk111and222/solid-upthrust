import { render } from '@solidjs/web'
import type { Component } from 'solid-js'
import { mountExamples } from './islands'
import { setupNavigation } from './navigation'
import 'uno.css'

const examples = import.meta.glob<{ default: Component }>('./examples/**/*.tsx')
const mount = () => mountExamples(document,examples,(Example,host) => render(() => Example({}),host))
let islands = mount()
const disposeExamples = () => islands.dispose()
document.addEventListener('docs:before-navigate',disposeExamples)
const disposeNavigation = setupNavigation(() => { islands = mount() })
const copyCode = async (event: MouseEvent) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('button')
  if (!button?.closest('[data-copy-code]')) return
  const source = button.closest('details')?.querySelector('code')?.textContent
  if (!source) return
  try { await navigator.clipboard.writeText(source); button.textContent = '已复制' }
  catch { button.textContent = '请选中代码复制' }
}
document.addEventListener('click',copyCode)
if (import.meta.hot) import.meta.hot.dispose(() => {
  islands.dispose(); disposeNavigation()
  document.removeEventListener('docs:before-navigate',disposeExamples)
  document.removeEventListener('click',copyCode)
})
