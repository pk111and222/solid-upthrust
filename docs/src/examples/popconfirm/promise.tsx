import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import Popconfirm from 'upthrust-ui/source/Popconfirm'

export default function Demo() {
  const [last, setLast] = createSignal('（未操作）')
  const wait = (ok: boolean) => new Promise<void>((resolve, reject) => setTimeout(() => (ok ? resolve() : reject(new Error('失败'))), 1500))
  return <div class="flex flex-col items-start gap-2">
    <Space>
      <Popconfirm title="标题" description="onConfirm 返回 Promise，resolve 后关闭" onConfirm={() => wait(true).then(() => setLast('提交成功，已关闭'))}>
        <Button type="primary">Promise 成功</Button>
      </Popconfirm>
      <Popconfirm title="标题" description="reject 时保持打开，可重试" onConfirm={() => wait(false).catch(e => { setLast(`${e.message}，保持打开`); throw e })}>
        <Button>Promise 失败</Button>
      </Popconfirm>
    </Space>
    <span class="text-on-surface-variant">最近结果：{last()}</span>
  </div>
}
