import Button from 'upthrust-ui/source/Button'
import Space, { type SpaceAlign } from 'upthrust-ui/source/Space'

const ALIGNS: SpaceAlign[] = ['center', 'start', 'end', 'baseline']

export default function Align() {
  return <div class="flex flex-wrap gap-md">
    {ALIGNS.map(align => (
      <div class="p-xs rounded bg-on-surface/4" data-space-align={align}>
        <Space align={align}>
          {align}
          <Button type="primary">按钮</Button>
          <span class="inline-block px-xs pt-md pb-xs rounded-sm bg-primary/20">块</span>
        </Space>
      </div>
    ))}
  </div>
}
