import Button from 'upthrust-ui/source/Button'
import Popover from 'upthrust-ui/source/Popover'
import QRCode from 'upthrust-ui/source/QRCode'

export default function PopoverDemo() {
  return <Popover content={<QRCode value="https://ant.design" bordered={false} />}>
    <Button type="primary">Hover me</Button>
  </Popover>
}
