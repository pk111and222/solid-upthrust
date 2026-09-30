import FloatButton, { type FloatButtonGroupProps, type FloatButtonProps } from 'upthrust-ui/source/FloatButton'

// classNames / styles 支持对象与函数；函数的 info.props 含合并后的 type / shape（Group 另含 placement）。
const buttonStyles: FloatButtonProps['styles'] = ({ props }) => props.type === 'primary'
  ? { root: { 'background-color': '#fa541c', 'border-color': '#fa541c' }, content: { 'font-weight': '600' } }
  : {}
const groupStyles: FloatButtonGroupProps['styles'] = {
  list: { 'box-shadow': '0 0 0 2px #1677ff' },
  itemContent: { color: '#1677ff' },
}

export default function StyleClass() {
  return <div style={{ position: 'relative', height: '200px', transform: 'translateZ(0)' }}>
    <FloatButton type="primary" shape="square" content="HOT" styles={buttonStyles} style={{ right: '94px' }} />
    <FloatButton.Group shape="square" styles={groupStyles} classNames={{ list: 'rounded-sm' }}>
      <FloatButton content="A" />
      <FloatButton content="B" />
    </FloatButton.Group>
  </div>
}
