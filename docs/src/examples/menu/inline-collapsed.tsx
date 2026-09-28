import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Menu from 'upthrust-ui/source/Menu'
import { collapseItems } from './data'

export default function InlineCollapsed() {
  const [collapsed, setCollapsed] = createSignal(false)
  return <div style={{ width: '256px' }}>
    <Button type="primary" class="mb-md" aria-label={collapsed() ? '展开菜单' : '收起菜单'} onClick={() => setCollapsed(v => !v)}
      icon={<span class={collapsed() ? 'i-mdi-menu-open rotate-180' : 'i-mdi-menu-open'} aria-hidden="true" />} />
    <Menu defaultSelectedKeys={['1']} defaultOpenKeys={['sub1']} mode="inline" theme="dark" inlineCollapsed={collapsed()} items={collapseItems} />
  </div>
}
