import Button from 'upthrust-ui/source/Button'
import Icon from 'upthrust-ui/source/Icon'

export default function Demo() {
  return <div class="flex flex-wrap gap-3"><Button icon={<Icon name="magnify" />}>搜索</Button><Button icon={<Icon name="download" />} iconPlacement="end">下载</Button></div>
}
