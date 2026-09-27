import Divider from 'upthrust-ui/source/Divider'
import Tag from 'upthrust-ui/source/Tag'

const variants = ['filled', 'solid', 'outlined'] as const
const presets = [
  { status: 'success', icon: 'i-mdi-check-circle-outline' },
  { status: 'processing', icon: 'i-mdi-sync animate-spin' },
  { status: 'warning', icon: 'i-mdi-alert-circle-outline' },
  { status: 'error', icon: 'i-mdi-close-circle-outline' },
  { status: 'default', icon: 'i-mdi-clock-outline' },
] as const

export default function Status() {
  return <div>
    {variants.map(variant => <div data-variant={variant}>
      <Divider titlePlacement="start">状态（{variant}）</Divider>
      <div class="flex flex-wrap items-center gap-2">
        {presets.map(({ status, icon }) => <Tag color={status} variant={variant} icon={<span class={icon} />}>{status}</Tag>)}
      </div>
    </div>)}
  </div>
}
