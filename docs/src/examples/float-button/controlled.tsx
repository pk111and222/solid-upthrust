import { createSignal } from 'solid-js'
import FloatButton from 'upthrust-ui/source/FloatButton'
import Icon from 'upthrust-ui/source/Icon'
import Switch from 'upthrust-ui/source/Switch'

// 受控 open（需配合 trigger）：外部开关控制菜单展开，点击触发按钮只经 onOpenChange 上报。
export default function Controlled() {
  const [open, setOpen] = createSignal(true)
  return <div style={{ position: 'relative', height: '260px', transform: 'translateZ(0)' }}>
    <FloatButton.Group open={open()} trigger="click" style={{ right: '24px' }} icon={<Icon name="headset" />}>
      <FloatButton />
      <FloatButton icon={<Icon name="comment-outline" />} />
    </FloatButton.Group>
    <FloatButton.Group open={open()} shape="square" trigger="click" style={{ right: '88px' }} icon={<Icon name="headset" />}>
      <FloatButton />
      <FloatButton icon={<Icon name="comment-outline" />} />
    </FloatButton.Group>
    <Switch checked={open()} onChange={setOpen} checkedChildren="开" unCheckedChildren="关" />
  </div>
}
