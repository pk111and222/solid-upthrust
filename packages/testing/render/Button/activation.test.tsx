import { afterEach, expect, it, vi } from 'vitest'
import Button from '../../../components/lib/Button'
import { mount } from '../../utils/mount'
let cleanup = () => {}
afterEach(() => { cleanup(); vi.useRealTimers() })
// 链接必须直接渲染为 a，避免嵌套交互元素和重复激活。
it('[button.link.root] renders one native anchor and calls once', () => {
  const onClick = vi.fn((e: MouseEvent) => e.preventDefault())
  const view = mount(() => <Button href="#target" onClick={onClick}>链接</Button>); cleanup = view.dispose
  expect(view.host.querySelector('button')).toBeNull()
  view.host.querySelector('a')!.click()
  expect(onClick).toHaveBeenCalledOnce()
})
// 销毁必须清理点击产生的 loading 和波纹计时器。
it('[button.loading.cleanup] clears pending timers', () => {
  vi.useFakeTimers()
  const view = mount(() => <Button loading={{delay: 1000}}>保存</Button>); cleanup = view.dispose
  view.host.querySelector('button')!.click()
  view.dispose(); cleanup = () => {}
  expect(vi.getTimerCount()).toBe(0)
})
