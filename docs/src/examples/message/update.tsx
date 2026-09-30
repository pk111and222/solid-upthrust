import Button from 'upthrust-ui/source/Button'
import { message } from 'upthrust-ui/source/Message'

// 同一个 key 再次 open 会原地更新内容并重新计时。
export default function Demo() {
  const key = 'updatable'
  const open = () => {
    message.open({ key, type: 'loading', content: '加载中...' })
    setTimeout(() => message.open({ key, type: 'success', content: '加载完成！', duration: 2 }), 1000)
  }
  return <Button type="primary" onClick={open}>打开可更新的消息</Button>
}
