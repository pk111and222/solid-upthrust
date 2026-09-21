import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Segmented from '../../../components/lib/Segmented'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import Form, { FormItem } from '../../../components/lib/Form'
import { FormItemContext, type FormItemControl } from '../../../components/lib/Input/context'
import type { FormInstance, SegmentedIns } from 'upthrust-competence'
import { mount } from '../../utils/mount'

let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })
function setup(view: Parameters<typeof mount>[0]) {
  const result = mount(view)
  dispose = result.dispose
  return result.host
}
function key(el: Element, keyName: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true }))
  flush()
}

// 字符串、数字和对象选项都应归一成 radio 选项，并保留 id、ARIA、样式和状态属性。
it('[segmented.render.contract] structure, normalization and attributes', () => {
  let machine: SegmentedIns | undefined
  const host = setup(() => <Segmented
    id="view-mode"
    aria-label="视图模式"
    options={['列表', 0, { label: '地图', value: 'map', disabled: true }]}
    defaultValue="列表"
    status="error"
    class="custom"
    style={{ width: '240px' }}
    ref={value => { machine = value }}
  />)
  const group = host.querySelector('[role="radiogroup"]')!
  expect(group.id).toBe('view-mode')
  expect(group.getAttribute('aria-label')).toBe('视图模式')
  expect(group.getAttribute('aria-invalid')).toBe('true')
  expect(group.classList.contains('custom')).toBe(true)
  expect((group as HTMLElement).style.width).toBe('240px')
  expect(group.querySelectorAll('[role="radio"]')).toHaveLength(3)
  expect(group.querySelector('[aria-checked="true"]')?.textContent).toBe('列表')
  expect(group.querySelectorAll('[aria-disabled="true"]')).toHaveLength(1)
  machine?.setItemRect('列表', { left: 4, width: 48 }); flush()
  expect(group.querySelector('[aria-hidden="true"]')?.getAttribute('style')).toContain('left: 4px')
})

// 非受控点击只替换选中值，重复点击与禁用选项不产生额外回调。
it('[segmented.render.uncontrolled] click and disabled guards', () => {
  const change = vi.fn()
  const host = setup(() => <Segmented options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b', disabled: true }, 'c']} defaultValue="a" onChange={change} />)
  const items = host.querySelectorAll<HTMLElement>('[role="radio"]')
  items[0].click(); items[1].click(); items[2].click(); flush()
  expect(change).toHaveBeenCalledTimes(1)
  expect(change).toHaveBeenLastCalledWith('c', undefined)
  expect(host.querySelector('[aria-checked="true"]')?.textContent).toBe('c')
})

// 受控父层接受更新时 DOM 跟随，拒绝更新时组件不能自行漂移。
it('[segmented.render.controlled] accepts and rejects parent updates', () => {
  const [value, setValue] = createSignal<string | number>('a', { ownedWrite: true })
  const change = vi.fn((next: string | number) => setValue(next))
  const fixed = vi.fn()
  const host = setup(() => <><Segmented options={['a', 'b']} value={value()} onChange={change} /><Segmented options={['a', 'b']} value="a" onChange={fixed} /></>)
  const groups = host.querySelectorAll('[role="radiogroup"]')
  groups[0].querySelectorAll<HTMLElement>('[role="radio"]')[1].click(); flush()
  expect(value()).toBe('b')
  expect(groups[0].querySelector('[aria-checked="true"]')?.textContent).toBe('b')
  groups[1].querySelectorAll<HTMLElement>('[role="radio"]')[1].click(); flush()
  expect(fixed).toHaveBeenCalledWith('b', undefined)
  expect(groups[1].querySelector('[aria-checked="true"]')?.textContent).toBe('a')
})

// 键盘遍历跳过禁用项并支持 Home/End、Enter；Escape 只取消 thumb 候选不提交。
it('[segmented.render.keyboard] traversal and commit semantics', () => {
  const change = vi.fn()
  const host = setup(() => <Segmented options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b', disabled: true }, { label: 'C', value: 'c' }]} defaultValue="a" onChange={change} />)
  const group = host.querySelector('[role="radiogroup"]') as HTMLElement
  group.focus(); key(group, 'ArrowRight')
  expect(host.querySelector('[aria-hidden="true"]')?.getAttribute('style')).toContain('opacity: 0')
  key(group, 'Enter')
  expect(change).toHaveBeenCalledWith('c', undefined)
  expect(host.querySelector('[aria-checked="true"]')?.textContent).toBe('C')
  key(group, 'Home'); key(group, 'Escape')
  expect(host.querySelector('[aria-checked="true"]')?.textContent).toBe('C')
})

// FormItem 注入字段值、回调、id、禁用和错误状态，显式属性仍覆盖字段协议。
it('[segmented.render.form] field injection and explicit precedence', () => {
  const [value, setValue] = createSignal<unknown>('a', { ownedWrite: true })
  const field = vi.fn((next: string | number) => setValue(next))
  const explicit = vi.fn()
  const ctx: FormItemControl = {
    value,
    onChange: field,
    id: () => 'field-mode',
    disabled: () => false,
    size: () => 'small',
    validateStatus: () => 'error',
  }
  const host = setup(() => <ConfigProvider componentDisabled><FormItemContext value={ctx}>
    <Segmented options={['a', 'b']} />
    <Segmented options={['a', 'b']} value="a" onChange={explicit} id="explicit-mode" disabled={false} />
  </FormItemContext></ConfigProvider>)
  const groups = host.querySelectorAll('[role="radiogroup"]')
  expect(groups[0].id).toBe('field-mode')
  expect(groups[0].getAttribute('aria-invalid')).toBe('true')
  expect(groups[0].querySelector('[role="radio"]')?.className).toContain('h-[24px]')
  groups[0].querySelectorAll<HTMLElement>('[role="radio"]')[1].click(); flush()
  expect(value()).toBe('b'); expect(field).toHaveBeenCalledWith('b', undefined)
  groups[1].querySelectorAll<HTMLElement>('[role="radio"]')[1].click(); flush()
  expect(explicit).toHaveBeenCalledWith('b', undefined); expect(field).toHaveBeenCalledTimes(1)
})

// 真实 Form.Item 的标量字段应驱动初始选择、点击写回和提交结果。
it('[segmented.render.form-item] real form store integration', async () => {
  const finish = vi.fn()
  let form: FormInstance | undefined
  const host = setup(() => <Form ref={instance => { form = instance }} initialValues={{ mode: 'a' }} onFinish={finish}>
    <FormItem name="mode"><Segmented aria-label="模式" options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]} /></FormItem>
    <button type="submit">提交</button>
  </Form>)
  const group = host.querySelector('[role="radiogroup"]')!
  expect(group.querySelector('[aria-checked="true"]')?.textContent).toBe('A')
  group.querySelectorAll<HTMLElement>('[role="radio"]')[1].click(); flush()
  expect(group.querySelector('[aria-checked="true"]')?.textContent).toBe('B')
  await form?.submit()
  expect(finish).toHaveBeenCalledWith({ mode: 'b' })
  form?.resetFields(); flush()
  expect(group.querySelector('[aria-checked="true"]')?.textContent).toBe('A')
})
