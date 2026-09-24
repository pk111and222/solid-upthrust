import { createSignal } from 'solid-js'
import Upload from 'upthrust-ui/source/Upload'
import type { UploadFile, UploadRequest } from 'upthrust-ui/source/Upload'

const request: UploadRequest = (file, handlers) => {
  handlers.onProgress({ percent: 50 })
  handlers.onSuccess({ url: `/files/${file.name}` })
  return { abort() {} }
}

export default function BasicUpload() {
  const [files, setFiles] = createSignal<UploadFile[]>([])
  return <div class="max-w-lg flex flex-col gap-3">
    <Upload value={files()} request={request} onChange={info => setFiles(info.fileList)} />
    <output>{JSON.stringify(files().map(({ name, status }) => ({ name, status })))}</output>
  </div>
}
