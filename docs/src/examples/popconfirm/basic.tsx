import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Popconfirm from 'upthrust-ui/source/Popconfirm'

export default function Demo() {
  const [last, setLast] = createSignal('（未操作）')
  return <div class="flex flex-col items-start gap-2">
    <Popconfirm
      title="删除任务"
      description="确定要删除这个任务吗？"
      onConfirm={() => { setLast('点击了「是」') }}
      onCancel={() => { setLast('点击了「否」') }}
      okText="是"
      cancelText="否"
    >
      <Button danger>删除</Button>
    </Popconfirm>
    <span class="text-on-surface-variant">最近操作：{last()}</span>
  </div>
}
