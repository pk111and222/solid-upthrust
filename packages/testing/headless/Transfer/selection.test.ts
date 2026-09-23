import { createRoot, flush } from 'solid-js'
import { expect, it, vi } from 'vitest'
import { createTransfer } from '../../../competence/src/transfer'

// 无可选项或重复全选时，不应发出没有实际选择变化的回调。
it('[transfer.selection.select-all-noop] ignores empty and unchanged bulk selection', () => {
  let dispose = () => {}
  try {
    createRoot(cleanup => {
      dispose = cleanup
      const onSelectChange = vi.fn()
      const transfer = createTransfer({
        dataSource: [{ key: 1, title: '可选' }, { key: 2, title: '锁定', disabled: true }],
        onSelectChange,
      })
      transfer.setSearch('left', '没有结果'); flush()
      transfer.selectAll('left', true); flush()
      expect(onSelectChange).not.toHaveBeenCalled()
      transfer.setSearch('left', ''); flush()
      transfer.selectAll('left', true); flush()
      expect(onSelectChange).toHaveBeenCalledTimes(1)
      transfer.selectAll('left', true); flush()
      expect(onSelectChange).toHaveBeenCalledTimes(1)
      expect(transfer.selectedKeys()).toEqual([1])
    })
  } finally { dispose() }
})
