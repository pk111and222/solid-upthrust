import { createSignal, flush } from 'solid-js'
import { expect, it, vi } from 'vitest'
import Segmented from '../../../components/lib/Segmented'
import { mount } from '../../utils/mount'
// 键盘候选从 options 移除后，不应提交已经消失的值。
it('[segmented.options.removed-candidate] rejects removed candidate', () => {
  const [options, setOptions] = createSignal(['a', 'b', 'c'], { ownedWrite: true })
  const change = vi.fn()
  const { host, dispose } = mount(() => <Segmented options={options()} defaultValue="a" onChange={change} />)
  try {
    const group = host.querySelector('[role="radiogroup"]')!
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); flush()
    setOptions(['a', 'c']); flush()
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); flush()
    expect(change).not.toHaveBeenCalled()
  } finally { dispose() }
})


// 候选项动态禁用后不能提交，重新启用后也不能恢复旧候选。
it('[segmented.options.disabled-candidate] invalidates disabled candidate', () => {
  const [disabled, setDisabled] = createSignal(false, { ownedWrite: true })
  const change = vi.fn()
  const { host, dispose } = mount(() => <Segmented options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b', disabled: disabled() }]} defaultValue="a" onChange={change} />)
  try {
    const group = host.querySelector('[role="radiogroup"]')!
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); flush()
    setDisabled(true); flush()
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); flush()
    setDisabled(false); flush()
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); flush()
    expect(change).not.toHaveBeenCalled()
    expect(host.querySelector('[aria-checked="true"]')?.textContent).toBe('A')
  } finally { dispose() }
})

// 卸载应断开 ResizeObserver，清空测量盒，阻止排队微任务和迟到回调再写入。
it('[segmented.lifecycle.cleanup] cancels queued measurements', async () => {
  let callback: ResizeObserverCallback | undefined
  const disconnect = vi.fn()
  vi.stubGlobal('ResizeObserver', class {
    constructor(next: ResizeObserverCallback) { callback = next }
    observe() {}
    disconnect = disconnect
  })
  let machine: import('../../../competence/src/segmented').SegmentedIns | undefined
  const view = mount(() => <Segmented options={['a', 'b']} defaultValue="a" ref={value => { machine = value }} />)
  try {
    const write = vi.spyOn(machine!, 'setItemRect')
    machine!.setItemRect('a', { left: 2, width: 40 }); flush()
    expect(machine!.thumbRect()).toBeDefined()
    write.mockClear()
    view.dispose()
    await Promise.resolve()
    callback?.([], {} as ResizeObserver)
    expect(disconnect).toHaveBeenCalledTimes(1)
    expect(write).not.toHaveBeenCalled()
    expect(machine!.thumbRect()).toBeUndefined()
  } finally { view.dispose(); vi.restoreAllMocks(); vi.unstubAllGlobals() }
})
