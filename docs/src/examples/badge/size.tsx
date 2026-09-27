import Avatar from 'upthrust-ui/source/Avatar'
import Badge from 'upthrust-ui/source/Badge'

export default function Size() {
  return <div class="flex items-center gap-6">
    <Badge size="middle" count={5}><Avatar shape="square" /></Badge>
    <Badge size="small" count={5}><Avatar shape="square" /></Badge>
    <Badge size="small" count={25}><Avatar shape="square" /></Badge>
  </div>
}
