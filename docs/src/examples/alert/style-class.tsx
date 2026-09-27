import Alert, { type AlertProps } from 'upthrust-ui/source/Alert'
import Button from 'upthrust-ui/source/Button'
import Flex from 'upthrust-ui/source/Flex'

// antd 用 createStaticStyles 生成类名；这里用 UnoCSS 工具类表达同一组样式（2px 虚线 #ccc、8px 圆角、12px 内边距）。
const classNames: AlertProps['classNames'] = { root: 'border-2 border-dashed border-[#ccc] rounded-lg p-[12px]' }

const styleFn: AlertProps['styles'] = ({ props: { type } }) => {
  if (type === 'success') {
    return { root: { 'background-color': 'rgba(82, 196, 26, 0.1)', 'border-color': '#b7eb8f' }, icon: { color: '#52c41a' } }
  }
  if (type === 'warning') {
    return { root: { 'background-color': 'rgba(250, 173, 20, 0.1)', 'border-color': '#ffe58f' }, icon: { color: '#faad14' } }
  }
  return {}
}

export default function StyleClass() {
  return <Flex vertical gap="middle">
    <Alert
      showIcon classNames={classNames} title="Object styles" type="info"
      styles={{ icon: { 'font-size': '18px' }, section: { 'font-weight': 500 } }}
      action={<Button size="small">Action</Button>}
    />
    <Alert showIcon classNames={classNames} title="Function styles" type="success" styles={styleFn} />
  </Flex>
}
