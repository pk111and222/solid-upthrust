import { afterEach, expect, expectTypeOf, it } from 'vitest'
import Segmented, { type SegmentedItem, type SegmentedProps } from '../../../components/lib/Segmented'
import type * as Public from '../../../components/lib'
import type { SegmentedIns } from 'upthrust-competence'
import { mount } from '../../utils/mount'

let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {} })

// 公共 barrel 应暴露 Segmented、选项类型和 ref 机器类型，而不是要求消费者深入 competence。
it('[segmented.exports.types] exposes the public component and option contract', () => {
  expectTypeOf<typeof Public.Segmented>().toEqualTypeOf<typeof Segmented>()
  expectTypeOf<SegmentedProps['options']>().toEqualTypeOf<SegmentedItem[] | undefined>()
  expectTypeOf<SegmentedProps['ref']>().toEqualTypeOf<((machine: SegmentedIns) => void) | undefined>()
})

// 最小选项组可以真实挂载，ref 返回 headless 机器，卸载后宿主清理完成。
it('[segmented.exports.mount] mounts and cleans up through the public entry', () => {
  let ref: SegmentedIns | undefined
  const view = mount(() => <Segmented options={['one', 'two']} defaultValue="one" ref={machine => { ref = machine }} />)
  dispose = view.dispose
  expect(Segmented).toBeDefined()
  expect(ref?.value()).toBe('one')
  expect(view.host.querySelectorAll('[role="radio"]')).toHaveLength(2)
  view.dispose(); dispose = () => {}
  expect(view.host.isConnected).toBe(false)
})
