import Button from 'upthrust-ui/source/Button'
import Popover from 'upthrust-ui/source/Popover'
import type { PopoverPlacement } from 'upthrust-ui'

const rows: PopoverPlacement[][] = [
  ['topLeft', 'top', 'topRight'],
  ['leftTop', 'left', 'leftBottom'],
  ['rightTop', 'right', 'rightBottom'],
  ['bottomLeft', 'bottom', 'bottomRight'],
]

export default function Demo() {
  return <div class="flex flex-col gap-3">
    {rows.map(row => (
      <div class="flex flex-wrap gap-3">
        {row.map(placement => (
          <Popover title={placement} content={`placement=${placement}`} placement={placement}>
            <Button variant="outlined">{placement}</Button>
          </Popover>
        ))}
      </div>
    ))}
  </div>
}
