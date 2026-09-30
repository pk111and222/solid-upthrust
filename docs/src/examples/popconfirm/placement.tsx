import Button from 'upthrust-ui/source/Button'
import Popconfirm from 'upthrust-ui/source/Popconfirm'
import type { PopconfirmPlacement } from 'upthrust-ui'

const rows: PopconfirmPlacement[][] = [
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
          <Popconfirm title="删除任务" description="确定要删除这个任务吗？" placement={placement}>
            <Button variant="outlined">{placement}</Button>
          </Popconfirm>
        ))}
      </div>
    ))}
  </div>
}
