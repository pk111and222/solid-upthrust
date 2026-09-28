import Menu from 'upthrust-ui/source/Menu'
import { sideItems } from './data'

export default function Vertical() {
  return <Menu style={{ width: '256px' }} mode="vertical" items={sideItems} />
}
