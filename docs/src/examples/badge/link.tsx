import Avatar from 'upthrust-ui/source/Avatar'
import Badge from 'upthrust-ui/source/Badge'

export default function Link() {
  return <a href="#badge-link" class="inline-flex" aria-label="查看 5 条消息"><Badge count={5}><Avatar shape="square" /></Badge></a>
}
