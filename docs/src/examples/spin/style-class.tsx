import Flex from 'upthrust-ui/source/Flex'
import Spin, { type SpinProps } from 'upthrust-ui/source/Spin'

// antd 用 createStaticStyles 生成 root 的 8px 内边距；这里用 UnoCSS 工具类。
const shared: SpinProps = { spinning: true, percent: 0, classNames: { root: 'p-xs' } }
const stylesObject: SpinProps['styles'] = { indicator: { color: '#00d4ff' } }
const stylesFn: SpinProps['styles'] = ({ props }) => props.size === 'small' ? { indicator: { color: '#722ed1' } } : {}

export default function StyleClass() {
  return <Flex align="center" gap="middle">
    <Spin {...shared} styles={stylesObject} />
    <Spin {...shared} styles={stylesFn} size="small" />
  </Flex>
}
