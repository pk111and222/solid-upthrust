import QRCode from 'upthrust-ui/source/QRCode'
import Space from 'upthrust-ui/source/Space'

export default function TypeDemo() {
  return <Space>
    <QRCode type="canvas" value="https://ant.design/" />
    <QRCode type="svg" value="https://ant.design/" />
  </Space>
}
