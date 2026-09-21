import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Rate from '../../../components/lib/Rate'
import ConfigProvider from '../../../components/lib/ConfigProvider'
import Form, { FormItem } from '../../../components/lib/Form'
import type { FormInstance } from 'upthrust-competence'
import { FormItemContext, type FormItemControl } from '../../../components/lib/Input/context'
import { mount } from '../../utils/mount'

let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })
function setup(view: Parameters<typeof mount>[0]) {
  const result = mount(view)
  dispose = result.dispose
  return result.host
}
function click(el: Element, clientX = 0) {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX }))
  flush()
}
function key(el: Element, keyName: string, type = 'keydown') {
  el.dispatchEvent(new KeyboardEvent(type, { key: keyName, bubbles: true, cancelable: true }))
  flush()
}

// 默认值、count、ARIA、id、静态列表类和每颗星的填充层应同时可观察。
it('[rate.render.contract] structure and visual fill contract', () => {
  const host = setup(() => <Rate id="rating" aria-label="服务评分" defaultValue={2} count={4} class="custom" />)
  const list = host.querySelector('ul')!
  const stars = host.querySelectorAll('li')
  expect(list.id).toBe('rating')
  expect(list.getAttribute('role')).toBe('slider')
  expect(list.getAttribute('aria-label')).toBe('服务评分')
  expect(list.classList.contains('list-none')).toBe(true)
  expect(list.classList.contains('custom')).toBe(true)
  expect(stars).toHaveLength(4)
  expect(list.getAttribute('aria-valuenow')).toBe('2')
  expect(stars[0].getAttribute('aria-hidden')).toBe('true')
  expect((stars[0].children[1] as HTMLElement).getAttribute('style')).toContain('0%')
  expect((stars[2].children[1] as HTMLElement).getAttribute('style')).toContain('100%')
})

// 受控 Rate 接受父层更新，父层拒绝时 DOM 不应自行漂移。
it('[rate.render.controlled] accept and reject updates', () => {
  const [value, setValue] = createSignal(2, { ownedWrite: true })
  const change = vi.fn((next: number) => setValue(next))
  const fixed = vi.fn()
  const host = setup(() => <><Rate value={value()} onChange={change} /><Rate value={2} onChange={fixed} /></>)
  const lists = host.querySelectorAll('ul')
  click(lists[0].querySelectorAll('li')[3])
  expect(value()).toBe(4)
  expect(lists[0].getAttribute('aria-valuenow')).toBe('4')
  click(lists[1].querySelectorAll('li')[3])
  expect(fixed).toHaveBeenLastCalledWith(4, undefined)
  expect(lists[1].getAttribute('aria-valuenow')).toBe('2')
})

// allowHalf 使用字符几何决定半星，hover 只更新裁剪预览，点击才提交。
it('[rate.render.half] pointer preview and commit', () => {
  const [value, setValue] = createSignal(2, { ownedWrite: true })
  const change = vi.fn((next: number) => setValue(next))
  const hover = vi.fn()
  const host = setup(() => <Rate value={value()} allowHalf onChange={change} onHoverChange={hover} />)
  const star = host.querySelectorAll('li')[2] as HTMLElement
  vi.spyOn(star, 'getBoundingClientRect').mockReturnValue({ left: 0, right: 20, top: 0, bottom: 20, width: 20, height: 20, x: 0, y: 0, toJSON: () => ({}) })
  star.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 5 }))
  flush()
  expect(value()).toBe(2)
  expect(hover).toHaveBeenLastCalledWith(2.5)
  expect((star.children[1] as HTMLElement).getAttribute('style')).toContain('50%')
  click(star, 5)
  expect(value()).toBe(2.5)
  expect(change).toHaveBeenLastCalledWith(2.5, undefined)
})

// FormItem 注入标量值、id、禁用和 onChange，显式属性仍优先于字段回调。
it('[rate.render.form] field integration and precedence', () => {
  const [value, setValue] = createSignal<unknown>(1, { ownedWrite: true })
  const field = vi.fn((next: number) => setValue(next))
  const explicit = vi.fn()
  const ctx: FormItemControl = {
    value,
    onChange: field,
    id: () => 'field-rating',
    disabled: () => true,
    size: () => undefined,
    validateStatus: () => undefined,
  }
  const host = setup(() => <ConfigProvider componentDisabled><FormItemContext value={ctx}>
    <Rate />
    <Rate value={1} onChange={explicit} id="explicit-rating" disabled={false} />
  </FormItemContext></ConfigProvider>)
  const lists = host.querySelectorAll('ul')
  expect(lists[0].id).toBe('field-rating')
  expect(lists[0].getAttribute('aria-disabled')).toBe('true')
  expect(lists[1].id).toBe('explicit-rating')
  expect(lists[1].getAttribute('aria-disabled')).toBe('false')
  click(lists[1].querySelectorAll('li')[2])
  expect(explicit).toHaveBeenLastCalledWith(3, undefined)
  expect(field).not.toHaveBeenCalled()
})

// 真实 Form.Item 的数字字段写入后，评分 DOM 与提交回调都应同步更新。
it('[rate.render.form-item] real form store integration', async () => {
  const finish = vi.fn()
  let form: FormInstance | undefined
  const host = setup(() => <Form ref={instance => { form = instance }} initialValues={{ rating: 2 }} onFinish={finish}>
    <FormItem name="rating"><Rate aria-label="表单评分" /></FormItem>
    <button type="submit">提交</button>
  </Form>)
  const list = host.querySelector('[role="slider"]')!
  click(list.querySelectorAll('li')[2])
  expect(list.getAttribute('aria-valuenow')).toBe('3')
  await form?.submit()
  expect(finish).toHaveBeenCalledWith({ rating: 3 })
  form?.resetFields(); flush()
  expect(list.getAttribute('aria-valuenow')).toBe('2')
})

// 键盘步进、0 清零、focus/blur 回调和自动聚焦使用同一可聚焦容器。
it('[rate.render.keyboard] focus lifecycle and reset', () => {
  const focus = vi.fn(), blur = vi.fn()
  const host = setup(() => <Rate defaultValue={2} autoFocus onFocus={focus} onBlur={blur} />)
  const list = host.querySelector('ul')!
  expect(document.activeElement).toBe(list)
  expect(focus).toHaveBeenCalledTimes(1)
  key(list, 'ArrowRight')
  expect(list.getAttribute('aria-valuenow')).toBe('3')
  key(list, '0')
  expect(list.getAttribute('aria-valuenow')).toBe('0')
  list.blur()
  flush()
  expect(blur).toHaveBeenCalledTimes(1)
})

// disabled 同时移出 Tab 顺序、阻止键盘和阻止点击写入。
it('[rate.render.disabled] interaction gates', () => {
  const change = vi.fn()
  const host = setup(() => <Rate defaultValue={2} disabled onChange={change} />)
  const list = host.querySelector('ul')!
  expect(list.getAttribute('tabindex')).toBe('-1')
  key(list, 'ArrowRight')
  click(list.querySelectorAll('li')[3])
  expect(change).not.toHaveBeenCalled()
  expect(list.getAttribute('aria-valuenow')).toBe('2')
})
