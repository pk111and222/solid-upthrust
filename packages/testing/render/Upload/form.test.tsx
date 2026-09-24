import { render } from '@solidjs/web'
import { flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import Upload, { Dragger } from '../../../components/lib/Upload'
import Form, { FormItem } from '../../../components/lib/Form'
import type { FormInstance } from '../../../competence/src/form'
import type { UploadRequest } from '../../../competence/src/upload'

let dispose: (() => void) | undefined
let host: HTMLDivElement | undefined

afterEach(() => {
  dispose?.()
  dispose = undefined
  host?.remove()
  host = undefined
  flush()
})

const mount = (view: Parameters<typeof render>[0]) => {
  host = document.createElement('div')
  document.body.append(host)
  dispose = render(view, host)
  flush()
  return host
}

const fakeRequest: UploadRequest = (_file, handlers) => {
  handlers.onSuccess({ url: '/uploaded.txt' })
  return { abort: vi.fn() }
}

it('writes Upload file lists to Form.Item, submits them, and restores initial values on reset', async () => {
  const finish = vi.fn()
  let form: FormInstance | undefined
  const view = mount(() => <Form ref={instance => { form = instance }} initialValues={{ attachments: [] }} onFinish={finish}>
    <FormItem name="attachments">{() => <Upload request={fakeRequest} />}</FormItem>
    <button type="submit">提交附件</button>
  </Form>)
  const input = view.querySelector<HTMLInputElement>('input[type="file"]')!
  const file = new File(['payload'], 'report.txt', { type: 'text/plain' })
  Object.defineProperty(input, 'files', { configurable: true, value: [file] })
  input.dispatchEvent(new Event('change', { bubbles: true }))
  flush()

  const uploaded = form?.getFieldValue('attachments') as Array<{ name: string; status: string }>
  expect(uploaded.map(item => [item.name, item.status])).toEqual([['report.txt', 'done']])
  await form?.submit()
  expect(finish).toHaveBeenCalledWith({ attachments: uploaded })

  form?.resetFields()
  flush()
  expect(form?.getFieldValue('attachments')).toEqual([])
  expect(view.textContent).not.toContain('report.txt')
})

it('writes Dragger selections to Form.Item while preserving the explicit callback', () => {
  const onChange = vi.fn()
  let form: FormInstance | undefined
  const view = mount(() => <Form ref={instance => { form = instance }} initialValues={{ files: [] }}>
    <FormItem name="files">{() => <Dragger request={fakeRequest} onChange={onChange} />}</FormItem>
  </Form>)
  const input = view.querySelector<HTMLInputElement>('input[type="file"]')!
  const file = new File(['payload'], 'dragged.txt', { type: 'text/plain' })
  Object.defineProperty(input, 'files', { configurable: true, value: [file] })
  input.dispatchEvent(new Event('change', { bubbles: true }))
  flush()

  expect((form?.getFieldValue('files') as Array<{ name: string }>).map(item => item.name)).toEqual(['dragged.txt'])
  expect(onChange).toHaveBeenCalled()
  expect(onChange.mock.calls.at(-1)?.[0].fileList[0].status).toBe('done')
})
