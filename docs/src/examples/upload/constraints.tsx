import { createSignal } from 'solid-js'
import Upload from 'upthrust-ui/source/Upload'
import type { UploadFile, UploadRequest } from 'upthrust-ui/source/Upload'

const attempts = new Map<string, number>()
const request: UploadRequest = (_file, handlers) => {
  const count = (attempts.get(_file.uid) ?? 0) + 1
  attempts.set(_file.uid, count)
  if (count === 1) handlers.onError(new Error('演示失败'))
  else handlers.onSuccess({ name: _file.name })
  return { abort() {} }
}

export default function UploadConstraints() {
  const [files, setFiles] = createSignal<UploadFile[]>([])
  return <div class="max-w-lg flex flex-col gap-3">
    <Upload value={files()} request={request} maxCount={2} accept=".txt,text/plain"
      beforeUpload={file => !file.name.startsWith('reject')} onChange={info => setFiles(info.fileList)}
      itemRender={(origin, file, _list, actions) => <div>{origin}{file.status === 'error' && <button type="button" onClick={actions.retry}>重试 {file.name}</button>}</div>} />
    <p>reject 开头的文件会被 beforeUpload 拒绝；失败项可通过 itemRender 提供重试，队列最多保留 2 项。</p>
    <output>{files().map(file => `${file.name}: ${file.status}`).join(', ') || '尚无文件'}</output>
  </div>
}
