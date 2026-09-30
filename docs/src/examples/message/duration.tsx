import Button from 'upthrust-ui/source/Button'
import { message } from 'upthrust-ui/source/Message'

// duration 单位为秒，默认 3；设为 0 时不自动关闭。
export default function Demo() {
  return <Button onClick={() => message.success('这是一条提示，10 秒后自动关闭', 10)}>自定义时长</Button>
}
