import Badge from 'upthrust-ui/source/Badge'

export default function Dot() {
  return <div class="flex items-center gap-6">
    <Badge dot><span class="i-mdi-bell-outline text-[16px]" role="img" aria-label="通知" /></Badge>
    <Badge dot><a href="#badge-dot">一个链接</a></Badge>
  </div>
}
