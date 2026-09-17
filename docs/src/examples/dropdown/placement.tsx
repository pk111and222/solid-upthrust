import { For } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import Dropdown, { type DropdownPlacement } from 'upthrust-ui/source/Dropdown'

const placements: DropdownPlacement[] = [
  'topLeft', 'top', 'topRight',
  'bottomLeft', 'bottom', 'bottomRight',
  'leftTop', 'left', 'leftBottom',
  'rightTop', 'right', 'rightBottom',
]

export default function Demo() {
  return <div class="flex flex-wrap items-center justify-center gap-x-40 gap-y-24 py-24 sm:px-40">
    <For each={placements}>{placement =>
      <Dropdown
        class="shrink-0"
        placement={placement}
        trigger="click"
        overlayStyle={{ width: '160px', height: '40px' }}
        menu={{ items: [{ key: placement, label: placement }] }}
      >
        <Button name={placement} class="w-28">{placement}</Button>
      </Dropdown>
    }</For>
  </div>
}
