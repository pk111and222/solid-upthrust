import { createSignal } from 'solid-js'
import Upload from 'upthrust-ui/source/Upload'
import type { UploadFile, UploadRequest } from 'upthrust-ui/source/Upload'

export default function CustomRender() {
  const [files, setFiles] = createSignal<UploadFile[]>([])
  const attempts = new Map<string, number>()
  const request: UploadRequest = (file, handlers) => {
    const count = (attempts.get(file.uid) ?? 0) + 1
    attempts.set(file.uid, count)
    if (count === 1) handlers.onError(new Error('演示失败'))
    else handlers.onSuccess({ name: file.name })
    return { abort() {} }
  }
  return <div class="flex flex-col gap-3 max-w-lg">
    <Upload value={files()} request={request} onChange={info => setFiles(info.fileList)}
      itemRender={(origin, file, _list, actions) => <div class="flex items-center gap-2 border border-solid border-outline-variant rounded p-2">
        <div class="min-w-0 flex-1">{origin}</div>
        {file.status === 'error' && <button type="button" onClick={actions.retry}>重试</button>}
      </div>} />
    <output>首次模拟失败，重试后成功：{files().map(file => `${file.name}（${file.status}）`).join(', ') || '暂无'}</output>
  </div>
}
