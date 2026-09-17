import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import Popover from 'upthrust-ui/source/Popover'

export default function Demo() {
  return <Space size="middle">
    <Popover title="悬停触发（默认）" content="鼠标移入卡片区域不会关闭" trigger="hover">
      <Button>hover</Button>
    </Popover>
    <Popover title="点击触发" content="点击外部或按 Esc 关闭" trigger="click">
      <Button>click</Button>
    </Popover>
    <Popover title="聚焦触发" content="Tab 到此按钮即可看到" trigger="focus">
      <Button variant="outlined">focus（可用 Tab 聚焦）</Button>
    </Popover>
    <Popover title="右键触发" content="锚定按钮而非鼠标位置" trigger="contextMenu">
      <Button variant="outlined">右键 contextMenu</Button>
    </Popover>
  </Space>
}
