import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import { notification, type NotificationPlacement } from 'upthrust-ui/source/Notification'

// useNotification 返回 api 与 holder：holder 放进组件树，通知就渲染在当前主题作用域内。
export default function Demo() {
  const [api, contextHolder] = notification.useNotification()
  const open = (placement: NotificationPlacement) => api.info({
    title: `Notification ${placement}`,
    description: '这是通知的内容。这是通知的内容。这是通知的内容。',
    placement,
  })
  return <>
    {contextHolder}
    <Space>
      <Button type="primary" onClick={() => open('topLeft')}>topLeft</Button>
      <Button type="primary" onClick={() => open('topRight')}>topRight</Button>
    </Space>
  </>
}
