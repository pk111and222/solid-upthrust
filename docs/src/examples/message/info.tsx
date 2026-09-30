import Button from 'upthrust-ui/source/Button'
import { message } from 'upthrust-ui/source/Message'

// 静态方法：未挂载 MessageProvider 时自动在 body 上创建容器。
export default function Demo() {
  return <Button type="primary" onClick={() => message.info('这是一条普通提醒')}>静态方法</Button>
}
