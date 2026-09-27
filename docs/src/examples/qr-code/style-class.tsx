import Flex from 'upthrust-ui/source/Flex'
import QRCode, { type QRCodeProps } from 'upthrust-ui/source/QRCode'
import { LOGO } from './logo'

const classNames: QRCodeProps['classNames'] = { root: 'border border-solid border-[#ccc] rounded-[8px] p-[16px]' }

const stylesObject: QRCodeProps['styles'] = {
  root: { border: '2px solid #1890ff', 'border-radius': '8px', padding: '16px', 'background-color': 'rgb(24, 144, 255, 0.1)' },
}
const stylesFunction: QRCodeProps['styles'] = info => info.props.type === 'canvas'
  ? { root: { border: '2px solid #ff4d4f', 'border-radius': '8px', padding: '16px', 'background-color': 'rgba(255, 77, 79, 0.1)' } }
  : undefined

export default function StyleClass() {
  const shared = { value: 'https://ant.design/', size: 160, classNames } satisfies QRCodeProps
  return <Flex gap="medium">
    <QRCode {...shared} styles={stylesObject} />
    <QRCode {...shared} type="canvas" icon={LOGO} styles={stylesFunction} />
  </Flex>
}
