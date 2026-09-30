import Button from 'upthrust-ui/source/Button'
import { notification } from 'upthrust-ui/source/Notification'

// icon 替换类型图标，不附带类型颜色。
export default function Demo() {
  const open = () => notification.open({
    title: '通知标题',
    description: '自定义图标的通知。',
    icon: <span class="flex text-primary" data-custom-icon>★</span>,
  })
  return <Button type="primary" onClick={open}>打开通知</Button>
}
