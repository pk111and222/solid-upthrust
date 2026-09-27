import { createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import QRCode from 'upthrust-ui/source/QRCode'
import Space from 'upthrust-ui/source/Space'

export default function Base() {
  const [text, setText] = createSignal('https://ant.design/')
  return <Space vertical align="center">
    <QRCode value={text() || '-'} />
    <Input placeholder="-" maxLength={60} value={text()} onChange={setText} />
  </Space>
}
