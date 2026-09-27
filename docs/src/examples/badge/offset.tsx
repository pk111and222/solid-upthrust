import Avatar from 'upthrust-ui/source/Avatar'
import Badge from 'upthrust-ui/source/Badge'

export default function Offset() {
  return <div class="flex items-center gap-10">
    <Badge count={5}><Avatar shape="square" alt="默认位置" /></Badge>
    <Badge count={5} offset={[10, 10]}><Avatar shape="square" alt="偏移位置" /></Badge>
  </div>
}
