import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import Switch from 'upthrust-ui/source/Switch'
import { notification } from 'upthrust-ui/source/Notification'

// 同一角落超过 threshold（默认 3）条时折叠为卡片堆，悬停展开；stack=false 时依次排列。
export default function Demo() {
  const [enabled, setEnabled] = createSignal(true)
  const open = () => {
    notification.config({ stack: enabled() ? { threshold: 3 } : false })
    notification.open({ title: '通知标题', description: `这是通知的内容。${'很长的内容。'.repeat(Math.round(Math.random() * 6))}`, duration: 8 })
  }
  return <Space>
    <Switch checked={enabled()} onChange={setEnabled} checkedChildren="堆叠" unCheckedChildren="平铺" />
    <Button type="primary" onClick={open}>打开通知</Button>
  </Space>
}
