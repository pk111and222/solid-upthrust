import { render } from '@solidjs/web'
import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import DatePicker from '../../../components/lib/DatePicker'
import Form, { FormItem } from '../../../components/lib/Form'
import type { FormInstance } from '../../../competence/src/form'

let dispose: (() => void) | undefined
let host: HTMLDivElement | undefined

const mount = (view: Parameters<typeof render>[0]) => {
  host = document.createElement('div')
  document.body.append(host)
  dispose = render(view, host)
  flush()
  return host
}

afterEach(() => {
  dispose?.()
  dispose = undefined
  host?.remove()
  host = undefined
  flush()
})

it('writes single and range changes to Form.Item and restores initial values', async () => {
  let form: FormInstance | undefined
  const finish = vi.fn()
  const view = mount(() => <Form ref={instance => { form = instance }} initialValues={{ date: '2026-09-15', range: ['2026-09-10', '2026-09-20'] }} onFinish={finish}>
    <FormItem name="date">{() => <DatePicker open />}</FormItem>
    <FormItem name="range">{() => <DatePicker.RangePicker open />}</FormItem>
  </Form>)

  const inputs = view.querySelectorAll('input')
  expect([...inputs].map(input => input.value)).toEqual(['2026-09-15', '2026-09-10', '2026-09-20'])
  const listboxes = [...document.querySelectorAll('[role="listbox"]')]
  const single = listboxes.find(listbox => listbox.querySelectorAll('[role="option"]').length === 42)!
  const range = listboxes.find(listbox => listbox.querySelectorAll('[role="option"]').length === 84)!
  ;[...single.querySelectorAll<HTMLElement>('[role="option"]')].find(option => option.textContent === '16' && option.getAttribute('aria-disabled') === 'false')!.click()
  flush()
  expect(form?.getFieldValue('date')).toBe('2026-09-16')
  ;[...range.querySelectorAll<HTMLElement>('[role="option"]')].find(option => option.textContent === '11' && option.getAttribute('aria-disabled') === 'false')!.click()
  flush()
  expect(form?.getFieldValue('range')).toEqual(['2026-09-11', '2026-09-20'])
  await form?.submit()
  expect(finish).toHaveBeenCalledWith({ date: '2026-09-16', range: ['2026-09-11', '2026-09-20'] })
  form?.resetFields()
  flush()
  expect([...inputs].map(input => input.value)).toEqual(['2026-09-15', '2026-09-10', '2026-09-20'])
})

it('forwards one real focus and blur event for single and range inputs', () => {
  const focused = vi.fn()
  const blurred = vi.fn()
  const view = mount(() => <><DatePicker onFocus={focused} onBlur={blurred} /><DatePicker.RangePicker onFocus={focused} onBlur={blurred} /></>)
  const inputs = view.querySelectorAll('input')
  for (const input of inputs) {
    input.dispatchEvent(new FocusEvent('focus', { bubbles: true }))
    input.dispatchEvent(new FocusEvent('blur', { bubbles: true }))
  }
  expect(focused).toHaveBeenCalledTimes(3)
  expect(blurred).toHaveBeenCalledTimes(3)
  expect(focused.mock.calls.every(([event]) => event instanceof FocusEvent)).toBe(true)
  expect(blurred.mock.calls.every(([event]) => event instanceof FocusEvent)).toBe(true)
})

it('keeps controlled dates authoritative and invokes only explicit callbacks inside Form.Item', () => {
  const [date, setDate] = createSignal<string | null>('2026-09-15')
  const [range, setRange] = createSignal<[string, string] | null>(['2026-09-10', '2026-09-20'])
  const singleChange = vi.fn()
  const rangeChange = vi.fn()
  let form: FormInstance | undefined
  const view = mount(() => <Form ref={instance => { form = instance }} initialValues={{ date: '2026-09-15', range: ['2026-09-10', '2026-09-20'] }}>
    <FormItem name="date">{() => <DatePicker open value={date()} onChange={singleChange} />}</FormItem>
    <FormItem name="range">{() => <DatePicker.RangePicker open value={range()} onChange={rangeChange} />}</FormItem>
  </Form>)
  const listboxes = [...document.querySelectorAll('[role="listbox"]')]
  const single = listboxes.find(listbox => listbox.querySelectorAll('[role="option"]').length === 42)!
  const rangePanel = listboxes.find(listbox => listbox.querySelectorAll('[role="option"]').length === 84)!
  ;[...single.querySelectorAll<HTMLElement>('[role="option"]')].find(option => option.textContent === '16' && option.getAttribute('aria-disabled') === 'false')!.click()
  ;[...rangePanel.querySelectorAll<HTMLElement>('[role="option"]')].find(option => option.textContent === '11' && option.getAttribute('aria-disabled') === 'false')!.click()
  flush()
  expect(singleChange).toHaveBeenCalledWith('2026-09-16')
  expect(rangeChange).toHaveBeenCalledWith(['2026-09-11', '2026-09-20'])
  expect(form?.getFieldValue('date')).toBe('2026-09-15')
  expect(form?.getFieldValue('range')).toEqual(['2026-09-10', '2026-09-20'])
  expect([...view.querySelectorAll('input')].map(input => input.value)).toEqual(['2026-09-15', '2026-09-10', '2026-09-20'])
  setDate('2026-09-17')
  setRange(['2026-09-12', '2026-09-21'])
  flush()
  expect([...view.querySelectorAll('input')].map(input => input.value)).toEqual(['2026-09-17', '2026-09-12', '2026-09-21'])
})
