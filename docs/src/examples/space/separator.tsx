import Divider from 'upthrust-ui/source/Divider'
import Space from 'upthrust-ui/source/Space'

export default function Separator() {
  return <div class="flex flex-col gap-md">
    <Space separator={<Divider orientation="vertical" />} data-space-separator>
      <a href="#space-separator">链接一</a>
      <a href="#space-separator">链接二</a>
      <a href="#space-separator">链接三</a>
    </Space>
    {/* split 为保留的旧名称，效果相同。 */}
    <Space split={<span class="text-on-surface-variant">/</span>} size="small" data-space-split>
      <span>首页</span>
      <span>组件</span>
      <span>Space</span>
    </Space>
  </div>
}
