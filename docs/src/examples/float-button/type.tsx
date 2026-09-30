import FloatButton from 'upthrust-ui/source/FloatButton'
import Icon from 'upthrust-ui/source/Icon'

// type 为 default（默认）或 primary。
export default function Type() {
  return <div style={{ position: 'relative', height: '160px', transform: 'translateZ(0)' }}>
    <FloatButton icon={<Icon name="help-circle-outline" />} type="primary" style={{ right: '24px' }} />
    <FloatButton icon={<Icon name="help-circle-outline" />} type="default" style={{ right: '94px' }} />
  </div>
}
