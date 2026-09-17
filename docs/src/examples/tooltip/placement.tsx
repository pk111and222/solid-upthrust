import Button from 'upthrust-ui/source/Button'
import Tooltip from 'upthrust-ui/source/Tooltip'
import type { TooltipPlacement } from 'upthrust-ui'

const rows: TooltipPlacement[][] = [
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
          <Tooltip title={placement} placement={placement}>
            <Button variant="outlined">{placement}</Button>
          </Tooltip>
        ))}
      </div>
    ))}
  </div>
}
