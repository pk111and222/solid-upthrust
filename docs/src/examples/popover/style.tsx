import Button from 'upthrust-ui/source/Button'
import Space from 'upthrust-ui/source/Space'
import Popover from 'upthrust-ui/source/Popover'

export default function Demo() {
  return <Space size="middle">
    <Popover
      title="根容器 class/style"
      content="演示 class/style"
      class="rounded outline-dashed outline-1 outline-primary"
      style={{ padding: '2px' }}
    >
      <Button variant="outlined">root class/style</Button>
    </Popover>
    <Popover
      title="浮层 overlayClass/overlayStyle"
      content="自定义边框与加粗"
      overlayClass="!border !border-solid !border-primary"
      overlayStyle={{ 'font-weight': 'bold' }}
    >
      <Button variant="outlined">overlayClass/overlayStyle</Button>
    </Popover>
    <Popover content={<span>JSX 内容，<strong>可加粗</strong>，可放<Button size="small">按钮</Button></span>}>
      <Button variant="outlined">JSX content</Button>
    </Popover>
  </Space>
}
