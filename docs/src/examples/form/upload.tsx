import { createSignal } from 'solid-js'
import Upload from 'upthrust-ui/source/Upload'
import Button from 'upthrust-ui/source/Button'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import type { UploadRequest } from 'upthrust-ui/source/Upload'

const request: UploadRequest = (file, handlers) => { handlers.onSuccess({ name: file.name }); return { abort() {} } }
export default function UploadForm() {
  const [result, setResult] = createSignal('')
  return <Form initialValues={{ files: [] }} onFinish={v => setResult(JSON.stringify(v))}><FormItem name="files" label="附件"><Upload request={request} /></FormItem><Button htmlType="submit">提交附件</Button><output class="mt-4 block break-all rounded bg-surface-container-low p-3 text-sm" aria-live="polite">{result()}</output></Form>
}
