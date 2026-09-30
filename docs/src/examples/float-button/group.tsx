import FloatButton from 'upthrust-ui/source/FloatButton'
import Icon from 'upthrust-ui/source/Icon'

// 圆形组：各按钮独立带阴影、间距 16；方形组：合并成紧凑列表，列表整体带阴影与 8px 圆角。
export default function Group() {
  return <div style={{ position: 'relative', height: '240px', transform: 'translateZ(0)' }}>
    <FloatButton.Group shape="circle" style={{ right: '24px' }}>
      <FloatButton icon={<Icon name="help-circle-outline" />} />
      <FloatButton />
      <FloatButton.BackTop visibilityHeight={0} />
    </FloatButton.Group>
    <FloatButton.Group shape="square" style={{ right: '94px' }}>
      <FloatButton icon={<Icon name="help-circle-outline" />} />
      <FloatButton />
      <FloatButton icon={<Icon name="sync" />} />
      <FloatButton.BackTop visibilityHeight={0} />
    </FloatButton.Group>
  </div>
}
