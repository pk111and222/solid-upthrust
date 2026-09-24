import { render } from '@solidjs/web'
import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import TimePicker from '../../../components/lib/TimePicker'
import Form, { FormItem } from '../../../components/lib/Form'
import type { FormInstance } from '../../../competence/src/form'

let dispose: (() => void) | undefined
const mount = (view: Parameters<typeof render>[0]) => {
  const host = document.createElement('div')
  document.body.append(host)
  dispose = render(view, host)
  flush()
  return host
}

afterEach(() => {
  dispose?.()
  dispose = undefined
  flush()
  document.body.innerHTML = ''
})

describe('TimePicker contracts', () => {
  // 默认时间按 format 展示，秒列只在秒精度模式出现。
  it('renders provided values and exposes seconds only when requested', () => {
    const host = mount(() => <>
      <TimePicker defaultValue="08:05" />
      <TimePicker format="HH:mm:ss" defaultValue="08:05:09" />
    </>)

    const inputs = host.querySelectorAll('input')
    expect(inputs[0].value).toBe('08:05')
    expect(inputs[1].value).toBe('08:05:09')
  })

  // off-step 小时不可选，步长网格内选项更新非受控值。
  it('opens the panel, selects a valid option, and rejects disabled lattice values', () => {
    const changed = vi.fn()
    const host = mount(() => <TimePicker open defaultValue="08:30" hourStep={4} onChange={changed} />)

    const options = [...document.querySelectorAll('[role="option"]')]
    const hours = options.slice(0, 24)
    expect(options).toHaveLength(24 + 60)
    hours.find(option => option.textContent === '05')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    flush()
    expect(changed).not.toHaveBeenCalled()
    hours.find(option => option.textContent === '04')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    flush()
    expect(changed).toHaveBeenCalledWith('04:30')
    expect(host.querySelector('input')?.value).toBe('04:30')
  })

  // 受控选择只通知父层，不绕过 value 直接改写输入。
  it('keeps controlled values authoritative while emitting picks', () => {
    const changed = vi.fn()
    const host = mount(() => <TimePicker open value="08:30" onChange={changed} />)

    const option = [...document.querySelectorAll('[role="option"]')].find(node => node.textContent === '10')!
    option.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    flush()

    expect(changed).toHaveBeenCalledWith('10:30')
    expect(host.querySelector('input')?.value).toBe('08:30')
  })

  // 父层更新受控 value 后，输入显示随之更新。
  it('reflects controlled value updates', () => {
    const [value, setValue] = createSignal<string | null>('08:30')
    const host = mount(() => <TimePicker value={value() ?? null} onChange={setValue} />)
    setValue('11:45')
    flush()

    expect(host.querySelector('input')?.value).toBe('11:45')
  })

  // 键盘只步进启用控件，禁用控件保持原值。
  it('steps the focused segment with the keyboard and does not change disabled values', () => {
    const host = mount(() => <>
      <TimePicker defaultValue="08:30" />
      <TimePicker disabled defaultValue="08:30" />
    </>)
    const [enabled, disabled] = [...host.querySelectorAll('input')]
    enabled.focus()
    enabled.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }))
    flush()
    disabled.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }))
    flush()

    expect(enabled.value).toBe('09:30')
    expect(disabled.value).toBe('08:30')
  })

  // 清空操作通知 null。
  it('clears the value through the clear affordance', () => {
    const changed = vi.fn()
    mount(() => <TimePicker defaultValue="08:30" onChange={changed} />)
    document.querySelector('[aria-label="清空"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    flush()

    expect(changed).toHaveBeenCalledWith(null)
  })

  // 焦点事件仅触发一次并保留浏览器传入的原生事件。
  it('forwards focus and blur events exactly once', () => {
    const focused = vi.fn()
    const blurred = vi.fn()
    const host = mount(() => <TimePicker onFocus={focused} onBlur={blurred} />)
    const input = host.querySelector('input')!
    input.dispatchEvent(new FocusEvent('focus', { bubbles: true }))
    input.dispatchEvent(new FocusEvent('blur', { bubbles: true }))

    expect(focused).toHaveBeenCalledOnce()
    expect(focused).toHaveBeenCalledWith(expect.any(FocusEvent))
    expect(blurred).toHaveBeenCalledOnce()
    expect(blurred).toHaveBeenCalledWith(expect.any(FocusEvent))
  })

  // 范围默认值生效；反向选择交换端点，清空同时清除两端。
  it('normalizes range ordering and clears both ends together', () => {
    const changed = vi.fn()
    const host = mount(() => <TimePicker.RangePicker open defaultValue={['09:00', '11:00']} onChange={changed} />)

    const inputs = host.querySelectorAll('input')
    expect(inputs).toHaveLength(2)
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(2 * (24 + 60))
    const endHourOptions = [...document.querySelectorAll('[role="option"]')].slice(24 + 60, 2 * (24 + 60))
    endHourOptions.find(option => option.textContent === '08')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    flush()
    expect(changed).toHaveBeenCalledWith(['08:00', '09:00'])

    document.querySelector('[aria-label="清空"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    flush()
    expect(changed).toHaveBeenLastCalledWith(null)
  })

  // 范围非受控模式持续保存更改，受控模式只向父层请求更改。
  it('stores uncontrolled range changes and preserves controlled range values', () => {
    const uncontrolled = mount(() => <TimePicker.RangePicker open defaultValue={['09:00', '11:00']} />)
    const options = [...document.querySelectorAll('[role="option"]')]
    options.slice(0, 24).find(option => option.textContent === '10')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    flush()
    expect([...uncontrolled.querySelectorAll('input')].map(input => input.value)).toEqual(['10:00', '11:00'])
    dispose?.()
    document.body.innerHTML = ''

    const changed = vi.fn()
    const controlled = mount(() => <TimePicker.RangePicker value={['09:00', '11:00']} open onChange={changed} />)
    const controlledOptions = [...document.querySelectorAll('[role="option"]')]
    controlledOptions.slice(0, 24).find(option => option.textContent === '10')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    flush()
    expect(changed).toHaveBeenCalledWith(['10:00', '11:00'])
    expect([...controlled.querySelectorAll('input')].map(input => input.value)).toEqual(['09:00', '11:00'])
  })

  // 单值与范围字段选择后应写回 Form store，并在 resetFields 后恢复初值。
  it('integrates single and range values with Form.Item submit and reset', async () => {
    const finish = vi.fn()
    let form: FormInstance | undefined
    const host = mount(() => <Form ref={instance => { form = instance }} initialValues={{ time: '08:30', range: ['09:00', '11:00'] }} onFinish={finish}>
      <FormItem name="time">{() => <TimePicker open />}</FormItem>
      <FormItem name="range">{() => <TimePicker.RangePicker open />}</FormItem>
    </Form>)

    const singleListbox = [...document.querySelectorAll('[role="listbox"]')].find(listbox => listbox.querySelectorAll('[role="option"]').length === 84)!
    const singleHours = [...singleListbox.querySelectorAll('[role="option"]')].slice(0, 24)
    singleHours.find(option => option.textContent === '10')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    flush()
    expect(form?.getFieldValue('time')).toBe('10:30')
    expect(host.querySelectorAll('input')[0].value).toBe('10:30')

    const rangeListbox = [...document.querySelectorAll('[role="listbox"]')].find(listbox => listbox.querySelectorAll('[role="option"]').length === 168)!
    const rangeHours = [...rangeListbox.querySelectorAll('[role="option"]')].slice(0, 24)
    rangeHours.find(option => option.textContent === '10')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    flush()
    expect(form?.getFieldValue('range')).toEqual(['10:00', '11:00'])
    expect([...host.querySelectorAll('input')].slice(1).map(input => input.value)).toEqual(['10:00', '11:00'])

    await form?.submit()
    expect(finish).toHaveBeenCalledWith({ time: '10:30', range: ['10:00', '11:00'] })
    form?.resetFields()
    flush()
    expect([...host.querySelectorAll('input')].map(input => input.value)).toEqual(['08:30', '09:00', '11:00'])
  })
})
