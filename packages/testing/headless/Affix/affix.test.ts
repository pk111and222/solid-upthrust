import { describe, expect, it } from 'vitest'
import { calculateAffix } from '../../../competence/src/affix'
const rect = { top: 100, left: 40, width: 200, height: 50 }
const target = { top: 20, bottom: 400 }
describe('Affix geometry', () => {
  // 未设置偏移时默认 offsetTop=0；恰好到达阈值时保持文档流。
  it('defaults to top zero and keeps the exact threshold in normal flow', () => {
    expect(calculateAffix(rect, target, {})).toBeUndefined()
    expect(calculateAffix({ ...rect, top: 20 }, target, {})).toBeUndefined()
    expect(calculateAffix({ ...rect, top: 19 }, target, {})).toEqual({ top: 20, left: 40, width: 200, height: 50, relativeTop: 1 })
  })
  // offsetTop 按目标可视区域顶部计算。
  it('resolves a top offset in the target viewport', () => {
    expect(calculateAffix({ ...rect, top: -30 }, target, { offsetTop: 12 })).toMatchObject({ top: 32, relativeTop: 62 })
  })
  // offsetBottom：原位置出现在可视区域前固定在底部。
  it('pins bottom content until its original location becomes visible', () => {
    expect(calculateAffix({ ...rect, top: 500 }, target, { offsetBottom: 12 })).toMatchObject({ top: 338, relativeTop: -162 })
    expect(calculateAffix({ ...rect, top: 338 }, target, { offsetBottom: 12 })).toBeUndefined()
  })
  // 回归：同时设置两个偏移时两者都生效（antd 6）——顶部满足时顶部优先，顶部不满足再判断底部（旧实现直接忽略 offsetBottom）。
  it('[affix.headless.bothOffsets] applies the bottom fix when the top fix does not qualify', () => {
    expect(calculateAffix({ ...rect, top: 0 }, target, { offsetTop: 0, offsetBottom: 50 })?.top).toBe(20)
    expect(calculateAffix({ ...rect, top: 500 }, target, { offsetTop: 0, offsetBottom: 50 })).toMatchObject({ top: 300, relativeTop: -200 })
    // 位于两条阈值之间时保持文档流。
    expect(calculateAffix({ ...rect, top: 200 }, target, { offsetTop: 0, offsetBottom: 50 })).toBeUndefined()
  })
  // 只设置 offsetBottom 时不再隐式启用 offsetTop=0：原位置在顶部之上也不固定到顶部。
  it('[affix.headless.bottomOnly] does not add an implicit top fix when only offsetBottom is set', () => {
    expect(calculateAffix({ ...rect, top: -30 }, target, { offsetBottom: 12 })).toBeUndefined()
  })
  // 禁用、零尺寸、空目标或非有限偏移都不固定。
  it('does not pin disabled, hidden, empty-target or invalid-offset content', () => {
    expect(calculateAffix(rect, target, { disabled: true, offsetBottom: 0 })).toBeUndefined()
    expect(calculateAffix({ ...rect, width: 0 }, target, { offsetBottom: 0 })).toBeUndefined()
    expect(calculateAffix(rect, { top: 10, bottom: 10 }, {})).toBeUndefined()
    expect(calculateAffix(rect, target, { offsetTop: Infinity })).toBeUndefined()
  })
})
