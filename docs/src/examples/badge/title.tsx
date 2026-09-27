import Avatar from 'upthrust-ui/source/Avatar'
import Badge from 'upthrust-ui/source/Badge'

export default function Title() {
  return <div class="flex items-center gap-8">
    <Badge count={5} title="自定义悬停文字"><Avatar shape="square" /></Badge>
    <Badge count={-5} title="负数"><Avatar shape="square" /></Badge>
    <Badge count={5} title={false}><Avatar shape="square" /></Badge>
  </div>
}
