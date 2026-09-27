import Avatar from 'upthrust-ui/source/Avatar'
import Badge from 'upthrust-ui/source/Badge'
export default function WithBadge() {
  return <div class="flex items-center gap-6"><Badge count={3}><Avatar shape="square" alt="未读消息">U</Avatar></Badge><Badge dot><Avatar alt="新动态">张</Avatar></Badge></div>
}
