import FloatButton from 'upthrust-ui/source/FloatButton'
import Icon from 'upthrust-ui/source/Icon'

// 设置 trigger 进入菜单模式：click 点击触发按钮开合、点击组外关闭；hover 移入展开、移出收起。展开时触发按钮显示关闭图标。
export default function GroupMenu() {
  return <div style={{ position: 'relative', height: '260px', transform: 'translateZ(0)' }}>
    <FloatButton.Group trigger="click" type="primary" style={{ right: '24px' }} icon={<Icon name="headset" />}>
      <FloatButton />
      <FloatButton icon={<Icon name="comment-outline" />} />
    </FloatButton.Group>
    <FloatButton.Group trigger="hover" type="primary" style={{ right: '94px' }} icon={<Icon name="headset" />}>
      <FloatButton />
      <FloatButton icon={<Icon name="comment-outline" />} />
    </FloatButton.Group>
  </div>
}
