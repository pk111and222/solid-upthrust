import QRCode from 'upthrust-ui/source/QRCode'
import Space from 'upthrust-ui/source/Space'

// antd 取 token.colorSuccessText / colorInfoText / colorBgLayout（默认主题的实际色值）。
export default function CustomColor() {
  return <Space>
    <QRCode value="https://ant.design/" color="#52c41a" />
    <QRCode value="https://ant.design/" color="#1677ff" bgColor="#f5f5f5" />
  </Space>
}
