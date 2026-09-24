import { createSignal } from 'solid-js'
import Upload from 'upthrust-ui/source/Upload'
import type { UploadFile, UploadRequest } from 'upthrust-ui/source/Upload'

const request: UploadRequest = (file, handlers) => {
  handlers.onSuccess({ url: `/images/${file.name}` })
  return { abort() {} }
}

export default function PictureCard() {
  const [files, setFiles] = createSignal<UploadFile[]>([
    { uid: 'one', name: 'banner-a.png', type: 'image/png', status: 'done', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect width="120" height="120" fill="%23722ed1"/%3E%3C/svg%3E' },
    { uid: 'two', name: 'banner-b.png', type: 'image/png', status: 'done', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect width="120" height="120" fill="%23eb2f96"/%3E%3C/svg%3E' },
  ])
  return <div class="flex flex-col gap-3 max-w-lg">
    <Upload listType="picture-card" accept="image/*" maxCount={4} value={files()} request={request}
      onChange={info => setFiles(info.fileList)} />
    <output>图片墙：{files().length}/4</output>
  </div>
}
