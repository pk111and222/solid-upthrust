import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Drawer from 'upthrust-ui/source/Drawer'
import Space from 'upthrust-ui/source/Space'

export default function Size() {
  const [size, setSize] = createSignal<'default' | 'large' | number | undefined>()
  return <>
    <Space>
      <Button type="primary" onClick={() => setSize('default')}>Open Default Size (378px)</Button>
      <Button type="primary" onClick={() => setSize('large')}>Open Large Size (736px)</Button>
      <Button type="primary" onClick={() => setSize(256)}>Open 256px</Button>
    </Space>
    <Drawer
      title={`${size()} Drawer`}
      placement="right"
      size={size() ?? 'default'}
      onClose={() => setSize(undefined)}
      open={size() !== undefined}
      extra={<Button type="primary" onClick={() => setSize(undefined)}>OK</Button>}
    >
      <p>Some contents...</p>
    </Drawer>
  </>
}
