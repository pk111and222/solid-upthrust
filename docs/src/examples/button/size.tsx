import Button from 'upthrust-ui/source/Button'
import Icon from 'upthrust-ui/source/Icon'

export default function Demo() {
  return <div class="flex flex-wrap items-center gap-3"><Button size="small">小号</Button><Button size="middle">中号</Button><Button size="large">大号</Button><Button shape="round">圆角</Button><Button shape="circle" aria-label="搜索" icon={<Icon name="magnify" />} /></div>
}
