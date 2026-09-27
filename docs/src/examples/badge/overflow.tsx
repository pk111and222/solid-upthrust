import Avatar from 'upthrust-ui/source/Avatar'
import Badge from 'upthrust-ui/source/Badge'

export default function Overflow() {
  return <div class="flex items-center gap-8">
    <Badge count={99}><Avatar shape="square" /></Badge>
    <Badge count={100}><Avatar shape="square" /></Badge>
    <Badge count={99} overflowCount={10}><Avatar shape="square" /></Badge>
    <Badge count={1000} overflowCount={999}><Avatar shape="square" /></Badge>
  </div>
}
