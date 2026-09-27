import Divider from 'upthrust-ui/source/Divider'
import Tag from 'upthrust-ui/source/Tag'

const variants = ['filled', 'solid', 'outlined'] as const
const presets = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'] as const
const customs = ['#f50', '#2db7f5', '#87d068', '#108ee9']

export default function Colorful() {
  return <div>
    {variants.map(variant => <div data-variant={variant}>
      <Divider titlePlacement="start">预设色（{variant}）</Divider>
      <div class="flex flex-wrap items-center gap-2" data-group="preset">{presets.map(color => <Tag color={color} variant={variant}>{color}</Tag>)}</div>
    </div>)}
    {variants.map(variant => <div data-variant={variant}>
      <Divider titlePlacement="start">自定义色（{variant}）</Divider>
      <div class="flex flex-wrap items-center gap-2" data-group="custom">{customs.map(color => <Tag color={color} variant={variant}>{color}</Tag>)}</div>
    </div>)}
  </div>
}
