import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Menu from 'upthrust-ui/source/Menu'
import Switch from 'upthrust-ui/source/Switch'
import { collapseItems } from './data'

export default function TooltipDemo() {
  const [collapsed, setCollapsed] = createSignal(true)
  const [enabled, setEnabled] = createSignal(true)
  return <div style={{ width: '256px' }}>
    <div class="flex items-center gap-sm mb-md">
      <Button type="primary" aria-label="切换收起" onClick={() => setCollapsed(v => !v)} icon={<span class="i-mdi-menu" aria-hidden="true" />} />
      <Switch checked={enabled()} onChange={setEnabled} checkedChildren="提示开" unCheckedChildren="提示关" />
    </div>
    {/* tooltip 配置 placement；false 关闭收起后的悬浮提示。 */}
    <Menu mode="inline" theme="dark" defaultSelectedKeys={['1']} inlineCollapsed={collapsed()}
      tooltip={enabled() ? { placement: 'left' } : false} items={collapseItems} />
  </div>
}
