import { createSignal } from 'solid-js'
import Upload from 'upthrust-ui/source/Upload'
import Form, { FormItem } from 'upthrust-ui/source/Form'
import type { UploadRequest } from 'upthrust-ui/source/Upload'

const request: UploadRequest = (file, handlers) => {
  handlers.onSuccess({ name: file.name })
  return { abort() {} }
}

export default function UploadForm() {
  const [submitted, setSubmitted] = createSignal('尚未提交')
  return <div class="max-w-lg flex flex-col gap-3">
    <Form initialValues={{ attachments: [] }} onFinish={values => setSubmitted(JSON.stringify(values))}>
      <FormItem name="attachments" label="附件">{() => <Upload request={request} />}</FormItem>
      <div class="flex gap-2"><button type="submit">提交附件</button><button type="reset">重置附件</button></div>
    </Form>
    <output>{submitted()}</output>
  </div>
}
