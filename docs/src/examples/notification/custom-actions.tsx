import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import { notification } from 'upthrust-ui/source/Notification'

// 通过 actions 自定义操作区，通过返回的句柄或 destroy(key) 关闭。
export default function Demo() {
  const open = () => {
    const key = `open${Date.now()}`
    notification.open({
      title: '通知标题',
      description: '通知的描述文案。可以在右下角放置操作按钮。',
      key,
      duration: 0,
      actions: <Space>
        <Button type="link" size="small" onClick={() => notification.destroy()}>全部关闭</Button>
        <Button type="primary" size="small" onClick={() => notification.destroy(key)}>确认</Button>
      </Space>,
    })
  }
  return <Button type="primary" onClick={open}>打开通知</Button>
}
