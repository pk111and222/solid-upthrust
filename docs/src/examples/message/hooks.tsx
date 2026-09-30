import Button from 'upthrust-ui/source/Button'
import { message } from 'upthrust-ui/source/Message'

// useMessage 返回 api 与 holder：holder 放进组件树，消息就渲染在当前主题作用域内。
export default function Demo() {
  const [messageApi, contextHolder] = message.useMessage()
  return <>
    {contextHolder}
    <Button type="primary" onClick={() => messageApi.info('Hello, Upthrust!')}>显示普通提醒</Button>
  </>
}
