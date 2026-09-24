import { createSignal } from 'solid-js'
import { Dragger } from 'upthrust-ui/source/Upload'
import type { UploadFile, UploadRequest } from 'upthrust-ui/source/Upload'

const request: UploadRequest = (file, handlers) => {
  handlers.onSuccess({ name: file.name })
  return { abort() {} }
}

export default function DraggerUpload() {
  const [files, setFiles] = createSignal<UploadFile[]>([])
  const [rejected, setRejected] = createSignal('')
  return <div class="max-w-lg flex flex-col gap-3">
    <Dragger value={files()} request={request} accept=".txt,text/plain" hint="拖放文本文件到此处，也可点击选择"
      onChange={info => setFiles(info.fileList)} onDropReject={items => setRejected(items.map(file => file.name).join(', '))} />
    <output>已接收：{files().map(file => file.name).join(', ') || '无'}</output>
    <output>已拒绝：{rejected() || '无'}</output>
  </div>
}
