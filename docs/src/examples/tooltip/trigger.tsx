import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import Tooltip from 'upthrust-ui/source/Tooltip'

export default function Demo() {
  return <Space size="middle">
    <Tooltip title="悬停触发（默认）" trigger="hover">
      <Button>hover</Button>
    </Tooltip>
    <Tooltip title="点击触发，再次点击关闭" trigger="click">
      <Button>click</Button>
    </Tooltip>
    <Tooltip title="聚焦触发，Tab 到此按钮即可看到" trigger="focus">
      <Button variant="outlined">focus（可用 Tab 聚焦）</Button>
    </Tooltip>
    <Tooltip title="右键触发，锚定按钮而非鼠标位置" trigger="contextMenu">
      <Button variant="outlined">右键 contextMenu</Button>
    </Tooltip>
  </Space>
}
