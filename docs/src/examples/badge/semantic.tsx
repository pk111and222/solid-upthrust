import Avatar from 'upthrust-ui/source/Avatar'
import Badge, { BadgeRibbon } from 'upthrust-ui/source/Badge'

export default function Semantic() {
  return <div class="flex flex-col gap-6">
    <div class="flex items-center gap-8">
      <Badge count={8} classNames={{ root: 'p-1 rounded-lg bg-on-surface/4' }} styles={{ indicator: { 'background-color': '#fff', color: '#999', 'border-color': '#d9d9d9' } }}><Avatar shape="square" /></Badge>
      <Badge status="processing" text="语义化文本颜色" style={{ color: '#1677ff' }} />
    </div>
    <BadgeRibbon text="语义化" classNames={{ content: 'font-semibold' }} styles={{ indicator: { 'box-shadow': '0 2px 6px rgba(0,0,0,.2)' } }}>
      <div class="rounded-lg border border-solid border-outline-variant bg-surface p-md">缎带的 root / indicator / content 可分别定制。</div>
    </BadgeRibbon>
  </div>
}
