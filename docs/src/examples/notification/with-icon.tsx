import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import { notification, type NotificationType } from 'upthrust-ui/source/Notification'

// 通知提醒框左侧有图标。
export default function Demo() {
  const open = (type: NotificationType) => notification[type]({
    title: '通知标题',
    description: '这是通知的内容。这是通知的内容。这是通知的内容。',
  })
  return <Space>
    <Button onClick={() => open('success')}>Success</Button>
    <Button onClick={() => open('info')}>Info</Button>
    <Button onClick={() => open('warning')}>Warning</Button>
    <Button danger onClick={() => open('error')}>Error</Button>
  </Space>
}
