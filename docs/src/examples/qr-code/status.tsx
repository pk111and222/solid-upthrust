import Flex from 'upthrust-ui/source/Flex'
import QRCode from 'upthrust-ui/source/QRCode'

const value = 'https://ant.design'

export default function Status() {
  return <Flex gap="medium" wrap>
    <QRCode value={value} status="loading" />
    <QRCode value={value} status="expired" onRefresh={() => console.log('refresh')} />
    <QRCode value={value} status="scanned" />
  </Flex>
}
