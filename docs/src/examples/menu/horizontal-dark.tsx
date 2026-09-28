import Menu from 'upthrust-ui/source/Menu'
import { topItems } from './data'

export default function HorizontalDark() {
  return <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['mail']} items={topItems} />
}
