import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import { message } from 'upthrust-ui/source/Message'

export default function Demo() {
  return <Space>
    <Button onClick={() => message.success('这是一条成功消息')}>Success</Button>
    <Button onClick={() => message.error('这是一条错误消息')}>Error</Button>
    <Button onClick={() => message.warning('这是一条警告消息')}>Warning</Button>
  </Space>
}
