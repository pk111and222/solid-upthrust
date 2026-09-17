import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import Tooltip from 'upthrust-ui/source/Tooltip'

export default function Demo() {
  return <Space size="middle">
    <Tooltip
      title="根容器 class/style"
      class="rounded outline-dashed outline-1 outline-primary"
      style={{ padding: '2px' }}
    >
      <Button variant="outlined">root class/style</Button>
    </Tooltip>
    <Tooltip
      title="浮层 overlayClass/overlayStyle：自定义背景与加粗"
      overlayClass="!bg-primary"
      overlayStyle={{ 'font-weight': 'bold' }}
    >
      <Button variant="outlined">overlayClass/overlayStyle</Button>
    </Tooltip>
    <Tooltip title={<span>JSX 标题，<strong>可加粗</strong></span>}>
      <Button variant="outlined">JSX title</Button>
    </Tooltip>
  </Space>
}
