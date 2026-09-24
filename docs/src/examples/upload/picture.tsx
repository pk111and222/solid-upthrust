import { createSignal } from 'solid-js'
import Upload from 'upthrust-ui/source/Upload'
import type { UploadFile, UploadRequest } from 'upthrust-ui/source/Upload'

const preview = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="96" viewBox="0 0 160 96"%3E%3Crect width="160" height="96" fill="%231677ff"/%3E%3Ccircle cx="42" cy="40" r="18" fill="%23fff" fill-opacity=".7"/%3E%3Cpath d="M12 82 58 48l24 20 20-14 46 28H12Z" fill="%23fff" fill-opacity=".8"/%3E%3C/svg%3E'

const request: UploadRequest = (file, handlers) => {
  handlers.onProgress({ percent: 65 })
  handlers.onSuccess({ url: `/files/${file.name}` })
  return { abort() {} }
}

export default function Picture() {
  const [files, setFiles] = createSignal<UploadFile[]>([
    { uid: 'cover', name: '项目封面.svg', type: 'image/svg+xml', size: 2048, status: 'done', url: preview },
  ])
  return <div class="flex flex-col gap-3 max-w-lg">
    <Upload listType="picture" accept="image/*" value={files()} request={request} onChange={info => setFiles(info.fileList)} />
    <output>图片列表：{files().map(file => file.name).join(', ') || '暂无图片'}</output>
  </div>
}
