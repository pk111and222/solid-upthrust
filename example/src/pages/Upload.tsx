import { type Component, createSignal, For, Show } from 'solid-js'
import { Upload, Dragger, Divider, Typography, Button, Space } from 'upthrust-ui'
import type { UploadFile, UploadRequest } from 'upthrust-ui'

const { Text, Title } = Typography

/**
 * A fake transport for the demos: "uploads" over ~1.2s with stepped
 * progress, then succeeds (or fails for files whose name contains 'fail').
 */
const fakeRequest: UploadRequest = (file, handlers) => {
  const fails = file.name.includes('fail')
  let pct = 0
  const timer = setInterval(() => {
    pct = Math.min(100, pct + 20)
    handlers.onProgress({ percent: pct })
    if (pct >= 100) {
      clearInterval(timer)
      if (fails) handlers.onError({ message: '上传失败（演示）' })
      else handlers.onSuccess({ url: `https://fake-cdn/${encodeURIComponent(file.name)}` })
    }
  }, 240)
  return { abort: () => clearInterval(timer) }
}

const UploadPage: Component = () => {
  const [textList, setTextList] = createSignal<UploadFile[]>([])
  const [picList, setPicList] = createSignal<UploadFile[]>([])
  const [cardList, setCardList] = createSignal<UploadFile[]>([])
  const [manualList, setManualList] = createSignal<UploadFile[]>([])
  const [maxOne, setMaxOne] = createSignal<UploadFile[]>([])

  const mirror = (setter: (v: UploadFile[]) => void) => (info: { fileList: UploadFile[] }) =>
    setter(info.fileList)

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">Upload 上传</h2>
      <p class="text-on-surface-variant mb-6">
        headless createUpload —— 文件队列状态机（受控镜像 + 同步 pending 镜像防批处理丢写），
        beforeUpload 拦截、maxCount（1 替换 / N 裁剪）、请求注入器（默认 XHR FormData），
        abort/remove/手动上传。视觉层四种 listType + Dragger 拖拽区，图片走 object URL 缩略图与全屏预览。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础用法（text 列表）</h3>
      <div class="mb-2">
        <Upload
          request={fakeRequest}
          value={textList()}
          onChange={mirror(setTextList)}
          beforeUpload={file => {
            if (file.name.includes('fail')) return false
            return true
          }}
        />
      </div>
      <Space wrap>
        <Text type="secondary">当前值：</Text>
        <Text code>{JSON.stringify(textList().map(f => [f.name, f.status]))}</Text>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">picture 列表（缩略图行 + 进度）</h3>
      <div class="mb-2">
        <Upload
          listType="picture"
          request={fakeRequest}
          value={picList()}
          onChange={mirror(setPicList)}
          accept="image/*"
        />
      </div>
      <Text type="secondary">仅图片（accept="image/*"），上传中显示行内进度条。</Text>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">picture-card 网格</h3>
      <div class="mb-2">
        <Upload
          listType="picture-card"
          request={fakeRequest}
          value={cardList()}
          onChange={mirror(setCardList)}
          accept="image/*"
          beforeUpload={file => !file.name.includes('fail')}
        />
      </div>
      <Text type="secondary">含 fail 字样的文件演示上传失败（红色角标 + hover 删除）。</Text>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">拖拽上传（Dragger）</h3>
      <div class="mb-2">
        <Dragger
          request={fakeRequest}
          value={manualList()}
          onChange={mirror(setManualList)}
          accept="image/*,.pdf,.zip"
          hint="单击或拖拽文件到此区域上传"
          hintStrong="支持 .pdf / .zip"
          onDropReject={files => console.warn('reject', files.map(f => f.name))}
        />
      </div>
      <Text type="secondary">拖拽时虚线框变主色；accept 之外的文件被拒并触发 onDropReject。</Text>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">手动上传</h3>
      <div class="mb-2">
        <Upload
          request={fakeRequest}
          autoUpload={false}
          value={manualList()}
          onChange={mirror(setManualList)}
        />
      </div>
      <Space>
        <Button size="small" onClick={() => console.log('开始上传')}>说明</Button>
        <Text type="secondary">选择后不自动上传，出现"开始上传"按钮（autoUpload=false）。</Text>
      </Space>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">maxCount=1（单文件替换）</h3>
      <div class="mb-2">
        <Upload
          request={fakeRequest}
          maxCount={1}
          value={maxOne()}
          onChange={mirror(setMaxOne)}
        />
      </div>
      <Text type="secondary">再选一个文件会替换已有文件，而不是追加。</Text>

      <Divider />

      <Title level={5}>API 要点</Title>
      <ul class="list-disc pl-6 text-on-surface-variant text-sm leading-6">
        <li><Text code>value / defaultValue</Text>：受控 fileList（UploadFile[]，含 uid/name/percent/status）</li>
        <li><Text code>beforeUpload</Text>：false 丢弃；Promise 异步校验大小/类型</li>
        <li><Text code>maxCount</Text>：1 替换整表；&gt;1 保留最新 N 个</li>
        <li><Text code>request</Text>：注入器替换默认 XHR（{ '{ onProgress, onSuccess, onError } => { abort }' }）</li>
        <li><Text code>listType</Text>：text / picture / picture-card</li>
        <li><Text code>Upload.Dragger</Text>：拖拽区变体（亦可从 upthrust-ui 直接导入 Dragger）</li>
      </ul>

      <Show when={textList().some(f => f.status === 'error')}>
        <div class="mt-4 text-error text-sm">
          <For each={textList().filter(f => f.status === 'error')}>
            {f => <div>失败：{f.name}</div>}
          </For>
        </div>
      </Show>
      <Divider />
      <h3 class="text-lg font-semibold mb-3">列表动作 / 附加信息 / 自定义渲染</h3>
      <Upload request={fakeRequest} defaultValue={[{ uid: 'guide', name: '使用指南.pdf', status: 'done', url: '/guide.pdf' }]}
        showUploadList={{ showDownloadIcon: true, showRemoveIcon: file => file.uid !== 'guide', extra: file => <small class="text-on-surface-variant">编号：{file.uid}</small> }}
        itemRender={(origin, file, _list, actions) => <div class="border border-solid border-outline-variant rounded p-2">
          {origin}<Show when={file.status === 'error'}><Button size="small" onClick={actions.retry}>重试</Button></Show>
        </div>} />
      <h3 class="text-lg font-semibold my-3">上传前裁剪为方图（图片墙）</h3>
      <Upload listType="picture-card" accept="image/*" request={fakeRequest} beforeUpload={async file => {
        if (!file.raw) return false
        const image = await createImageBitmap(file.raw)
        try {
          const side = Math.min(image.width, image.height)
          const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256
          const context = canvas.getContext('2d'); if (!context) return false
          context.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, 256, 256)
          return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('裁剪失败')), 'image/png'))
        } finally { image.close() }
      }} />
      <p class="mt-2 text-on-surface-variant">beforeUpload 可返回 Blob/File（或 Promise）替换实际上传文件。此示例居中裁剪；自定义裁剪交互可通过同一入口接入。</p>
    </div>
  )
}

export default UploadPage
