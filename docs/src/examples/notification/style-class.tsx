import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import { notification, type NotificationArgsProps } from 'upthrust-ui/source/Notification'

const styles: NotificationArgsProps['styles'] = {
  root: { 'background-color': '#f6ffed', border: '2px solid #95de64' },
  title: { color: '#237804', 'font-weight': '600' },
  description: { color: '#389e0d' },
}
// 函数形式：按 props 返回语义样式，这里错误类型换成红色。
const stylesFn: NotificationArgsProps['styles'] = ({ props }) => props.type === 'error'
  ? { root: { 'background-color': 'rgb(255, 242, 240)', border: '2px solid #ffccc7' }, title: { color: 'rgb(207, 19, 34)', 'font-weight': '600' } }
  : styles

export default function Demo() {
  return <Space>
    <Button onClick={() => notification.success({ title: '对象样式', description: '对象形式的语义化样式。', styles })}>对象样式</Button>
    <Button type="primary" onClick={() => notification.error({ title: '函数样式', description: '函数形式的语义化样式。', styles: stylesFn, duration: 0, key: 'style-fn' })}>函数样式</Button>
  </Space>
}
