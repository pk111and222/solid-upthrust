import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import { message, type MessageArgsProps } from 'upthrust-ui/source/Message'

const styles: MessageArgsProps['styles'] = {
  root: { 'background-color': '#f6ffed', border: '2px solid #95de64', 'border-radius': '16px', 'box-shadow': '4px 4px 0 #d9f7be' },
  icon: { color: '#237804' },
  title: { color: '#237804', 'font-weight': '600' },
}
// 函数形式：按 props 返回语义样式，这里错误类型换成红色。
const stylesFn: MessageArgsProps['styles'] = ({ props }) => props.type === 'error'
  ? { root: { 'background-color': '#fff2f0', border: '2px solid #ffccc7', 'border-radius': '16px', 'box-shadow': '4px 4px 0 #ffccc7' }, icon: { color: '#cf1322' }, title: { color: '#cf1322', 'font-weight': '600' } }
  : styles

export default function Demo() {
  return <Space>
    <Button onClick={() => message.open({ type: 'success', content: '对象形式的语义化样式', styles })}>对象样式</Button>
    <Button type="primary" onClick={() => message.open({ type: 'error', content: '函数形式的语义化样式', styles: stylesFn })}>函数样式</Button>
  </Space>
}
