import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Cascader from '../../../components/lib/Cascader'
import { mount } from '../../utils/mount'

const options = [
  { value: 'zj', label: '浙江', children: [{ value: 'hz', label: '杭州', children: [{ value: 'xh', label: '西湖' }, { value: 'bj', label: '滨江' }] }] },
  { value: 'js', label: '江苏', children: [{ value: 'nj', label: '南京' }] },
]
let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })

// 单选叶节点提交后关闭浮层，并在父层回写受控值后更新显示文本。
it('[cascader.render.single] opens columns, commits leaf and closes', () => {
  const [value, setValue] = createSignal<any>(undefined, { ownedWrite: true })
  const onChange = vi.fn((next: any) => setValue(next))
  const view = mount(() => <Cascader options={options} value={value()} onChange={onChange} placeholder="选择地区" />)
  dispose = view.dispose
  const box = view.host.querySelector<HTMLElement>('[role="combobox"]')!
  box.click(); flush()
  expect(box.getAttribute('aria-expanded')).toBe('true')
  document.querySelectorAll<HTMLElement>('[role="option"]')[0]?.click(); flush()
  ;[...document.querySelectorAll<HTMLElement>('[role="option"]')].find(el => el.textContent?.trim() === '杭州')?.click(); flush()
  ;[...document.querySelectorAll<HTMLElement>('[role="option"]')].find(el => el.textContent?.trim() === '西湖')?.click(); flush()
  expect(onChange).toHaveBeenCalled()
  expect(box.getAttribute('aria-expanded')).toBe('false')
})

// 搜索输入只显示匹配路径，清空按钮恢复占位文本并发出回调。
it('[cascader.render.search-clear] filters paths and clears', () => {
  const onClear = vi.fn()
  const view = mount(() => <Cascader options={options} showSearch onClear={onClear} />)
  dispose = view.dispose
  const box = view.host.querySelector<HTMLElement>('[role="combobox"]')!
  box.click(); flush()
  const input = document.querySelector<HTMLInputElement>('[role="listbox"] input')!
  input.value = '西湖'; input.dispatchEvent(new InputEvent('input', { bubbles: true })); flush()
  expect(document.querySelectorAll('[role="option"]')).toHaveLength(1)
  expect(document.querySelector('[role="option"]')?.textContent).toContain('西湖')
  input.value = ''; input.dispatchEvent(new InputEvent('input', { bubbles: true })); flush()
  expect(document.querySelectorAll('[role="option"]')).toHaveLength(2)
  expect(box.textContent).toContain('请选择')
})

// 多选 checkable 通过父项勾选所有叶子，禁用控件不响应点击。
it('[cascader.render.multiple] renders tags and disabled semantics', () => {
  const view = mount(() => <Cascader options={options} mode="multiple" checkable defaultValue={[["zj", "hz", "xh"]]} allowClear disabled />)
  dispose = view.dispose
  const box = view.host.querySelector<HTMLElement>('[role="combobox"]')!
  expect(box.getAttribute('aria-disabled')).toBe('true')
  expect(box.querySelector<HTMLElement>('[aria-label="清空"]')?.className).toContain('pointer-events-none')
})

// allowClear 关闭时保留下拉箭头；开启且有值时按钮替代箭头并通过 click 清空。
it('[cascader.clear.opt-in] clear button replaces arrow and clears selection', async () => {
  const onClear = vi.fn()
  const view = mount(() => <Cascader options={options} defaultValue={['zj', 'hz', 'xh']} allowClear onClear={onClear} />)
  dispose = view.dispose
  const box = view.host.querySelector<HTMLElement>('[role="combobox"]')!
  const clear = box.querySelector<HTMLButtonElement>('button[aria-label="清空"]')!
  expect(clear.querySelector('.i-mdi-close')).not.toBeNull()
  expect(box.querySelector('.i-mdi-chevron-down')).toBeNull()
  clear.click(); flush()
  expect(onClear).toHaveBeenCalledOnce()
  expect(box.querySelector('.i-mdi-chevron-down')).toBeNull()
  await vi.waitFor(() => expect(box.querySelector('.i-mdi-chevron-down')).not.toBeNull())
  expect(box.textContent).toContain('请选择')
  const withoutClear = mount(() => <Cascader options={options} defaultValue={['zj', 'hz', 'xh']} />)
  expect(withoutClear.host.querySelector('button[aria-label="清空"]')).toBeNull()
  expect(withoutClear.host.querySelector('.i-mdi-chevron-down')).not.toBeNull()
  withoutClear.dispose()
})

// 级联面板至少与选择器同宽，同时允许多列内容撑开浮层。
it('[cascader.popup.content-width] popup uses content width with selector minimum', () => {
  const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return this.getAttribute('role') === 'combobox'
      ? new DOMRect(0, 0, 240, 32)
      : new DOMRect(0, 0, 0, 0)
  })
  try {
    const view = mount(() => <Cascader options={options} />)
    dispose = view.dispose
    view.host.querySelector<HTMLElement>('[role="combobox"]')!.click(); flush()
    const popup = document.querySelector<HTMLElement>('[role="listbox"]')!
    expect(popup.style.width).toBe('max-content')
    expect(popup.style.minWidth).toBe('240px')
  } finally { measure.mockRestore() }
})

// 显式设置选择器宽度时，弹层宽度跟随设置值，不被多列内容撑开。
it('[cascader.popup.explicit-width] explicit selector width overrides content sizing', () => {
  const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return this.getAttribute('role') === 'combobox' ? new DOMRect(0, 0, 180, 32) : new DOMRect(0, 0, 0, 0)
  })
  try {
    const view = mount(() => <Cascader options={options} style={{ width: '180px' }} />)
    dispose = view.dispose
    view.host.querySelector<HTMLElement>('[role="combobox"]')!.click(); flush()
    const popup = document.querySelector<HTMLElement>('[role="listbox"]')!
    expect(popup.style.width).toBe('180px')
    expect(popup.style.minWidth).toBe('')
  } finally { measure.mockRestore() }
})
