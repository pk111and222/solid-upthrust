import { render } from '@solidjs/web'
import { flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import ColorPicker from '../../../components/lib/ColorPicker'
import Form, { FormItem } from '../../../components/lib/Form'
import type { FormInstance } from '../../../competence/src/form'

let dispose: (() => void) | undefined
let host: HTMLDivElement | undefined

afterEach(() => {
  dispose?.()
  dispose = undefined
  host?.remove()
  host = undefined
  flush()
})

it('serializes an inline preset to Form.Item and restores the initial color', async () => {
  const finish = vi.fn()
  const changed = vi.fn()
  let form: FormInstance | undefined
  host = document.createElement('div')
  document.body.append(host)
  dispose = render(() => <Form ref={instance => { form = instance }} initialValues={{ color: '#ff0000' }} onFinish={finish}>
    <FormItem name="color">{() => <ColorPicker inline allowClear onChange={changed} presets={[{ label: '颜色', colors: ['#00f'] }]} />}</FormItem>
  </Form>, host)
  flush()
  expect(host.querySelector<HTMLInputElement>('[aria-label="颜色值"]')?.value).toBe('#ff0000')
  host.querySelector<HTMLButtonElement>('[aria-label="预设颜色 #0000ff"]')!.click()
  flush()
  expect(changed).toHaveBeenCalledOnce()
  expect(form?.getFieldValue('color')).toBe('#0000ff')
  await form?.submit()
  expect(finish).toHaveBeenCalledWith({ color: '#0000ff' })
  form?.resetFields()
  flush()
  expect(host.querySelector<HTMLInputElement>('[aria-label="颜色值"]')?.value).toBe('#ff0000')
})
