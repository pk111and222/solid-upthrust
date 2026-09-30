import Button from 'upthrust-ui/source/Button'
import { message } from 'upthrust-ui/source/Message'

// then 在消息关闭后执行，可以串联多条提示。
export default function Demo() {
  const run = () => {
    message.open({ type: 'loading', content: '处理中..', duration: 2.5 })
      .then(() => message.success('处理完成', 2.5))
      .then(() => message.info('全部结束', 2.5))
  }
  return <Button onClick={run}>顺序显示消息</Button>
}
