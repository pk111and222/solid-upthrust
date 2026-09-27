import Button from 'upthrust-ui/source/Button'
import Flex from 'upthrust-ui/source/Flex'
import QRCode, { type QRCodeProps } from 'upthrust-ui/source/QRCode'
import Space from 'upthrust-ui/source/Space'
import Spin from 'upthrust-ui/source/Spin'

const value = 'https://ant.design'

const customStatusRender: QRCodeProps['statusRender'] = info => {
  switch (info.status) {
    case 'expired':
      return <div>
        <span class="i-mdi-close-circle inline-block align-[-0.125em]" style={{ color: 'red' }} /> {info.locale.expired}
        <p><Button type="link" onClick={() => info.onRefresh?.()}><span class="i-mdi-reload inline-block" /> {info.locale.refresh}</Button></p>
      </div>
    case 'loading':
      return <Space vertical><Spin /><p>Loading...</p></Space>
    case 'scanned':
      return <div><span class="i-mdi-check-circle inline-block align-[-0.125em]" style={{ color: 'green' }} /> {info.locale.scanned}</div>
    default:
      return null
  }
}

export default function CustomStatusRender() {
  return <Flex gap="medium" wrap>
    <QRCode value={value} status="loading" statusRender={customStatusRender} />
    <QRCode value={value} status="expired" onRefresh={() => console.log('refresh')} statusRender={customStatusRender} />
    <QRCode value={value} status="scanned" statusRender={customStatusRender} />
  </Flex>
}
