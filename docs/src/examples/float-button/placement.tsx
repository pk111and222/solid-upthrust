import FloatButton from 'upthrust-ui/source/FloatButton'
import Icon from 'upthrust-ui/source/Icon'

// placement 控制菜单展开方向：top（默认）/ bottom / left / right；左右方向时列表横向排布。
const Center = () => <FloatButton icon={<Icon name="swap-vertical" />} />

export default function Placement() {
  const style = (right: number, bottom: number) => ({ right: `${right}px`, bottom: `${bottom}px` })
  return <div style={{ position: 'relative', height: '300px', transform: 'translateZ(0)' }}>
    <FloatButton.Group trigger="click" placement="top" style={style(210, 190)} icon={<Icon name="arrow-up" />}><Center /><Center /></FloatButton.Group>
    <FloatButton.Group trigger="click" placement="right" style={style(290, 110)} icon={<Icon name="arrow-right" />}><Center /><Center /></FloatButton.Group>
    <FloatButton.Group trigger="click" placement="bottom" style={style(210, 30)} icon={<Icon name="arrow-down" />}><Center /><Center /></FloatButton.Group>
    <FloatButton.Group trigger="click" placement="left" style={style(130, 110)} icon={<Icon name="arrow-left" />}><Center /><Center /></FloatButton.Group>
  </div>
}
