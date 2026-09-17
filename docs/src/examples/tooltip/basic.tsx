import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import Tooltip from 'upthrust-ui/source/Tooltip'

export default function Demo() {
  return <Space size="middle">
    <Tooltip title="默认提示（上方，悬停 100ms 后出现）">
      <Button>悬停我</Button>
    </Tooltip>
    <Tooltip title="这条提示文本较长，最大宽度 250px，超出会自动换行显示完整内容">
      <Button variant="outlined">长文本</Button>
    </Tooltip>
    <Tooltip title={false}>
      <Button variant="outlined">title=false 不弹出</Button>
    </Tooltip>
  </Space>
}
