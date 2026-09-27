import QRCode from 'upthrust-ui/source/QRCode'
import { LOGO } from './logo'

export default function IconDemo() {
  return <QRCode errorLevel="H" value="https://ant.design/" icon={LOGO} />
}
