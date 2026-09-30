import Button from 'upthrust-ui/source/Button'
import { message } from 'upthrust-ui/source/Message'

// 返回值可直接调用以关闭消息。
export default function Demo() {
  const show = () => {
    const hide = message.loading('正在执行中..', 0)
    setTimeout(hide, 2500)
  }
  return <Button onClick={show}>显示加载中</Button>
}
