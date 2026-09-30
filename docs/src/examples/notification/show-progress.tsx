import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import { notification } from 'upthrust-ui/source/Notification'

// showProgress 显示剩余时间进度条；pauseOnHover 控制悬停是否暂停。
export default function Demo() {
  const open = (pauseOnHover: boolean) => notification.open({
    title: '通知标题',
    description: '底部进度条展示剩余时间。',
    showProgress: true,
    pauseOnHover,
  })
  return <Space>
    <Button type="primary" onClick={() => open(true)}>悬停暂停</Button>
    <Button onClick={() => open(false)}>悬停不暂停</Button>
  </Space>
}
