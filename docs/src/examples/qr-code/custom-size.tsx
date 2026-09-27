import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Icon from 'upthrust-ui/source/Icon'
import QRCode from 'upthrust-ui/source/QRCode'
import Space from 'upthrust-ui/source/Space'
import { LOGO } from './logo'

const MIN_SIZE = 48
const MAX_SIZE = 300

export default function CustomSize() {
  const [size, setSize] = createSignal(160)
  const increase = () => setSize(prev => Math.min(prev + 10, MAX_SIZE))
  const decline = () => setSize(prev => Math.max(prev - 10, MIN_SIZE))
  return <>
    <Space.Compact style={{ 'margin-bottom': '16px' }}>
      <Button onClick={decline} disabled={size() <= MIN_SIZE} icon={<Icon name="minus" />}>Smaller</Button>
      <Button onClick={increase} disabled={size() >= MAX_SIZE} icon={<Icon name="plus" />}>Larger</Button>
    </Space.Compact>
    <QRCode errorLevel="H" size={size()} iconSize={size() / 4} value="https://ant.design/" icon={LOGO} />
  </>
}
