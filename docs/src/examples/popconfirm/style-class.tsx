import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import Popconfirm, { type PopconfirmProps } from 'upthrust-ui/source/Popconfirm'

const styles: PopconfirmProps['styles'] = {
  container: { 'background-color': '#eee', 'box-shadow': 'inset 5px 5px 3px #fff, inset -5px -5px 3px #ddd, 0 0 3px rgba(0,0,0,0.2)' },
  title: { color: '#262626' },
  content: { color: '#262626' },
}
// 函数形式：按 props 返回语义样式，这里关闭箭头时换成深色容器。
const stylesFn: PopconfirmProps['styles'] = (info) => info.props.arrow === false
  ? { container: { 'background-color': 'rgba(53, 71, 125, 0.8)', padding: '12px', 'border-radius': '4px' }, title: { color: '#fff' }, content: { color: '#fff' } }
  : {}

export default function Demo() {
  return <Space>
    <Popconfirm title="对象样式" description="classNames / styles 传对象" classNames={{ container: 'p-[10px]' }} styles={styles}>
      <Button>对象</Button>
    </Popconfirm>
    <Popconfirm title="函数样式" description="styles 传函数" arrow={false} styles={stylesFn}>
      <Button type="primary">函数</Button>
    </Popconfirm>
  </Space>
}
