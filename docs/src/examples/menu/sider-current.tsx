import { createSignal } from 'solid-js'
import Menu from 'upthrust-ui/source/Menu'
import { collapseItems } from './data'

const rootKeys = ['sub1', 'sub2']

export default function SiderCurrent() {
  const [openKeys, setOpenKeys] = createSignal(['sub1'])
  // 只展开当前父级菜单：新展开的一级子菜单替换旧的。
  const onOpenChange = (keys: string[]) => {
    const latest = keys.find(key => !openKeys().includes(key))
    setOpenKeys(latest && rootKeys.includes(latest) ? [latest] : keys)
  }
  return <Menu mode="inline" openKeys={openKeys()} onOpenChange={onOpenChange} style={{ width: '256px' }}
    items={collapseItems.filter(item => item.children)} />
}
