import Avatar from 'upthrust-ui/source/Avatar'
import Badge from 'upthrust-ui/source/Badge'

export default function Basic() {
  return <div class="flex items-center gap-6">
    <Badge count={5}><Avatar shape="square" alt="头像一" /></Badge>
    <Badge count={0} showZero><Avatar shape="square" alt="头像二" /></Badge>
    <Badge count={<span class="i-mdi-clock-outline text-[16px] text-[#f5222d]" />}><Avatar shape="square" alt="头像三" /></Badge>
  </div>
}
