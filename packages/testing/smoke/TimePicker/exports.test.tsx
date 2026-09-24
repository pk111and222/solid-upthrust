import { describe, expect, it } from 'vitest'
import TimePicker, { RangePicker } from '../../../components/lib/TimePicker'

describe('TimePicker public exports', () => {
  // 默认组件同时挂载 RangePicker 静态成员并公开具名子组件。
  it('exports the picker and its named range picker', () => {
    expect(TimePicker).toBeTypeOf('function')
    expect(TimePicker.RangePicker).toBe(RangePicker)
  })
})
