import FloatButton from 'upthrust-ui/source/FloatButton'
import Icon from 'upthrust-ui/source/Icon'

// badge 接收 Badge 的属性（不含 status / text / title / children），徽标定位在按钮右上角；圆形按钮额外内缩以贴合圆边。
export default function BadgeDemo() {
  return <div style={{ position: 'relative', height: '260px', transform: 'translateZ(0)' }}>
    <FloatButton shape="circle" badge={{ dot: true }} style={{ right: '164px' }} />
    <FloatButton.Group shape="circle" style={{ right: '94px' }}>
      <FloatButton badge={{ count: 5, color: 'blue' }} href="https://ant.design/index-cn" target="_blank" />
      <FloatButton badge={{ count: 5 }} />
    </FloatButton.Group>
    <FloatButton.Group shape="square" style={{ right: '24px' }}>
      <FloatButton badge={{ dot: true }} icon={<Icon name="help-circle-outline" />} />
      <FloatButton badge={{ count: 5, color: 'blue' }} />
      <FloatButton badge={{ count: 123, overflowCount: 999 }} />
    </FloatButton.Group>
  </div>
}
