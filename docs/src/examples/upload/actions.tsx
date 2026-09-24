import { createSignal } from 'solid-js'
import Upload from 'upthrust-ui/source/Upload'
import type { UploadFile, UploadRequest } from 'upthrust-ui/source/Upload'

const request: UploadRequest = (file, handlers) => {
  handlers.onSuccess({ name: file.name })
  return { abort() {} }
}

export default function Actions() {
  const [downloaded, setDownloaded] = createSignal('尚未下载')
  return <div class="flex flex-col gap-3 max-w-lg">
    <Upload request={request} defaultValue={[{ uid: 'guide', name: '使用指南.pdf', size: 4096, status: 'done', url: '/guide.pdf' }]}
      showUploadList={{ showDownloadIcon: true, showRemoveIcon: false, extra: file => <small>编号：{file.uid}</small> }}
      onDownload={file => setDownloaded(file.name)} />
    <output>最近下载：{downloaded()}</output>
  </div>
}
