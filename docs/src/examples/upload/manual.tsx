import { createSignal } from 'solid-js'
import Upload from 'upthrust-ui/source/Upload'
import type { UploadFile, UploadRequest } from 'upthrust-ui/source/Upload'

const request: UploadRequest = (file, handlers) => {
  handlers.onSuccess({ name: file.name })
  return { abort() {} }
}

export default function ManualUpload() {
  const [files, setFiles] = createSignal<UploadFile[]>([])
  return <div class="max-w-lg flex flex-col gap-3">
    <Upload value={files()} request={request} autoUpload={false} onChange={info => setFiles(info.fileList)} />
    <output>{files().map(file => `${file.name}: ${file.status ?? '待上传'}`).join(', ') || '选择文件后再手动上传'}</output>
  </div>
}
