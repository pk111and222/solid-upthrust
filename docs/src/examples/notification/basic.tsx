import Button from 'upthrust-ui/source/Button'
import { notification } from 'upthrust-ui/source/Notification'

// 静态方法：未挂载 NotificationProvider 时首次调用会在 body 上创建容器；默认 4.5 秒后关闭。
export default function Demo() {
  const open = () => notification.open({
    title: '通知标题',
    description: '这是通知的内容。这是通知的内容。这是通知的内容。',
    onClick: () => console.log('Notification Clicked!'),
  })
  return <Button type="primary" onClick={open}>打开通知</Button>
}
