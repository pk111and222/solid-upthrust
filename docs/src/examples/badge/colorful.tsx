import Badge from 'upthrust-ui/source/Badge'
import Divider from 'upthrust-ui/source/Divider'

const colors = ['pink', 'red', 'yellow', 'orange', 'cyan', 'green', 'blue', 'purple', 'geekblue', 'magenta', 'volcano', 'gold', 'lime'] as const
const customs = ['#f50', 'rgb(45, 183, 245)', 'hsl(102, 53%, 61%)', 'hwb(205 6% 9%)']

export default function Colorful() {
  return <div>
    <Divider titlePlacement="start">预设色</Divider>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2" data-group="preset">{colors.map(color => <Badge color={color} text={color} />)}</div>
    <Divider titlePlacement="start">自定义色</Divider>
    <div class="flex flex-col gap-1" data-group="custom">{customs.map(color => <Badge color={color} text={color} />)}</div>
  </div>
}
