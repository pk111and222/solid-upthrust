import FloatButton from 'upthrust-ui/source/FloatButton'
import Icon from 'upthrust-ui/source/Icon'

// shape 为 circle（默认）或 square。
export default function Shape() {
  return <div style={{ position: 'relative', height: '160px', transform: 'translateZ(0)' }}>
    <FloatButton shape="circle" type="primary" icon={<Icon name="headset" />} style={{ right: '94px' }} />
    <FloatButton shape="square" type="primary" icon={<Icon name="headset" />} style={{ right: '24px' }} />
  </div>
}
