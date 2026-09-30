import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import { notification, type NotificationPlacement } from 'upthrust-ui/source/Notification'

// 可以设置通知从右上角、右下角、左下角、左上角、顶部居中、底部居中弹出。
const PLACEMENTS: NotificationPlacement[] = ['top', 'bottom', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight']
export default function Demo() {
  const open = (placement: NotificationPlacement) => notification.info({
    title: `Notification ${placement}`,
    description: '这是通知的内容。这是通知的内容。这是通知的内容。',
    placement,
  })
  return <Space wrap>{PLACEMENTS.map(p => <Button type="primary" onClick={() => open(p)}>{p}</Button>)}</Space>
}
