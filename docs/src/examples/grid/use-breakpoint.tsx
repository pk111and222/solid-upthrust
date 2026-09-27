import { For } from 'solid-js'
import { useBreakpoint } from 'upthrust-ui/source/Grid'
import Tag from 'upthrust-ui/source/Tag'

const SCREENS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'] as const

export default function UseBreakpoint() {
  const screens = useBreakpoint()
  return <div class="flex flex-wrap items-center gap-xs">
    当前命中的断点：
    <span class="inline-flex flex-wrap gap-xs" data-grid-screens>
      <For each={SCREENS.filter(screen => screens()[screen])}>
        {screen => <Tag color="blue">{screen}</Tag>}
      </For>
    </span>
  </div>
}
