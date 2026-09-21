import { createRoot, createSignal, flush } from 'solid-js'
import { expect, it } from 'vitest'
import { createSegmented } from '../../../competence/src/segmented'

// 移除选项必须丢弃对应测量盒，再加入同键选项也不能复用过期几何。
it('[segmented.geometry.removed] drops removed option rectangles', () => {
  let dispose = () => {}
  try {
    createRoot(cleanup => {
      dispose = cleanup
      const [options, setOptions] = createSignal([{ label: 'A', value: 'a' }], { ownedWrite: true })
      const machine = createSegmented({ get options() { return options() }, defaultValue: 'a' })
      flush()
      machine.setItemRect('a', { left: 2, width: 40 }); flush()
      expect(machine.thumbRect()).toEqual({ left: 2, width: 40 })
      setOptions([]); flush()
      expect(machine.thumbRect()).toBeUndefined()
      setOptions([{ label: 'A', value: 'a' }]); flush()
      expect(machine.thumbRect()).toBeUndefined()
    })
  } finally { dispose() }
})
