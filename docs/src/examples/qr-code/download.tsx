import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import QRCode, { type QRCodeType } from 'upthrust-ui/source/QRCode'
import Segmented from 'upthrust-ui/source/Segmented'
import Space from 'upthrust-ui/source/Space'
import { LOGO } from './logo'

function doDownload(url: string, fileName: string) {
  const a = document.createElement('a')
  a.download = fileName
  a.href = url
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export default function Download() {
  let host!: HTMLDivElement
  const [renderType, setRenderType] = createSignal<QRCodeType>('canvas')
  const downloadCanvas = () => {
    const canvas = host.querySelector<HTMLCanvasElement>('canvas')
    if (canvas) doDownload(canvas.toDataURL(), 'QRCode.png')
  }
  const downloadSvg = () => {
    const svg = host.querySelector<SVGElement>('svg[role="img"]')
    if (!svg) return
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' })
    doDownload(URL.createObjectURL(blob), 'QRCode.svg')
  }
  return <div ref={host}>
    <Space vertical>
      <Segmented options={['canvas', 'svg']} value={renderType()} onChange={value => setRenderType(value as QRCodeType)} />
      <div>
        <QRCode type={renderType()} value="https://ant.design/" bgColor="rgba(255,255,255,0.5)" style={{ 'margin-bottom': '16px' }} icon={LOGO} />
        <Button type="primary" onClick={() => (renderType() === 'canvas' ? downloadCanvas() : downloadSvg())}>Download</Button>
      </div>
    </Space>
  </div>
}
