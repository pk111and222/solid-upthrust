import Button from 'upthrust-ui/source/Button'
import { notification } from 'upthrust-ui/source/Notification'

// 同一个 key 再次 open 会原地更新内容并重新计时。
export default function Demo() {
  const key = 'updatable'
  const open = () => {
    notification.open({ key, title: '通知标题', description: '描述。' })
    setTimeout(() => notification.open({ key, title: '新标题', description: '新的描述。' }), 1000)
  }
  return <Button type="primary" onClick={open}>打开可更新的通知</Button>
}
