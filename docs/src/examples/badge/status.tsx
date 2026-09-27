import Badge from 'upthrust-ui/source/Badge'

const statuses = ['success', 'error', 'default', 'processing', 'warning'] as const
const labels = { success: '成功', error: '错误', default: '默认', processing: '进行中', warning: '警告' }

export default function Status() {
  return <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2">{statuses.map(status => <Badge status={status} />)}</div>
    <div class="flex flex-col gap-1">{statuses.map(status => <Badge status={status} text={labels[status]} />)}</div>
  </div>
}
