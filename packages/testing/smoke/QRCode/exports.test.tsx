import { expect, it } from 'vitest'
import type * as Public from '../../../components/lib'
import { createQRCodeMatrix, type QRCodeMatrix } from '../../../competence/src'
import QRCode, { type QRCodeProps } from '../../../components/lib/QRCode'
import { mount } from '../../utils/mount'

const props: Public.QRCodeProps = {
  value: 'https://ant.design/',
  type: 'svg' satisfies Public.QRCodeType,
  errorLevel: 'H' satisfies Public.QRCodeErrorCorrectionLevel,
  status: 'scanned' satisfies Public.QRCodeStatus,
  locale: { scanned: 'OK' } satisfies Public.QRCodeLocale,
  statusRender: (info: Public.QRCodeStatusRenderInfo) => info.locale.scanned,
  classNames: { cover: 'c' } satisfies Public.QRCodeSemanticClassNames,
  styles: { root: { margin: '0' } } satisfies Public.QRCodeSemanticStyles,
} satisfies QRCodeProps
const PublicQRCode: typeof Public.QRCode = QRCode
// 公开入口：QRCode 与 competence 的矩阵函数可用；最小挂载后可清理。
it('[qrcode.exports] mounts QRCode from the public entry', () => {
  const matrix: QRCodeMatrix = createQRCodeMatrix({ value: 'x', size: 160 })
  expect(matrix.numCells).toBe(21)
  const view = mount(() => <PublicQRCode {...props} />)
  try { expect(view.host.textContent).toBe('OK') } finally { view.dispose() }
  expect(view.host.isConnected).toBe(false)
})
