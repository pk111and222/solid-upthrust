import { createSignal } from 'solid-js'
import QRCode, { type QRCodeErrorCorrectionLevel } from 'upthrust-ui/source/QRCode'
import Segmented from 'upthrust-ui/source/Segmented'

export default function ErrorLevel() {
  const [level, setLevel] = createSignal<QRCodeErrorCorrectionLevel>('L')
  return <>
    <QRCode style={{ 'margin-bottom': '16px' }} errorLevel={level()} value="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" />
    <Segmented options={['L', 'M', 'Q', 'H']} value={level()} onChange={value => setLevel(value as QRCodeErrorCorrectionLevel)} />
  </>
}
