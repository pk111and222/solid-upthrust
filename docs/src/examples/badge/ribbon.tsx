import { BadgeRibbon } from 'upthrust-ui/source/Badge'

const card = (title: string) => <div class="rounded-lg border border-solid border-outline-variant bg-surface p-md">
  <div class="font-medium mb-2">{title}</div><div class="text-on-surface-variant text-sm">推开窗户，举起望远镜。</div>
</div>

export default function Ribbon() {
  return <div class="flex flex-col gap-4 px-2">
    <BadgeRibbon text="默认">{card('主题主色')}</BadgeRibbon>
    <BadgeRibbon text="粉色" color="pink">{card('预设色 pink')}</BadgeRibbon>
    <BadgeRibbon text="青色" color="cyan">{card('预设色 cyan')}</BadgeRibbon>
    <BadgeRibbon text="火山" color="volcano" placement="start">{card('start 方位')}</BadgeRibbon>
    <BadgeRibbon text="自定义" color="#2f54eb">{card('自定义颜色')}</BadgeRibbon>
  </div>
}
