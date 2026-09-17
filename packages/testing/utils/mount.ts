import { render } from '@solidjs/web'
import { flush } from 'solid-js'

/** 每个测试显式释放自己的挂载点，不清空其他测试的 DOM。 */
export function mount(view: Parameters<typeof render>[0]) {
  const host = document.createElement('div')
  document.body.append(host)
  let dispose = () => {}
  try { dispose = render(view, host); flush() } catch (error) { host.remove(); throw error }
  return { host, dispose: () => { dispose(); flush(); host.remove() } }
}
