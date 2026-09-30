import Button from 'upthrust-ui/source/Button'
import { notification } from 'upthrust-ui/source/Notification'

// duration 单位为秒，默认 4.5；0 / null / false 表示不自动关闭。
export default function Demo() {
  const open = () => notification.open({
    title: '通知标题',
    description: '我不会自动关闭。我不会自动关闭。我不会自动关闭。',
    duration: 0,
  })
  return <Button type="primary" onClick={open}>打开通知</Button>
}
