import { describe, expect, it } from 'vitest'
import { calculateAffix } from '../../../competence/src/affix'
const rect = { top: 100, left: 40, width: 200, height: 50 }
const target = { top: 20, bottom: 400 }
describe('Affix geometry', () => {
  it('defaults to top zero and keeps the exact threshold in normal flow', () => {
    expect(calculateAffix(rect, target, {})).toBeUndefined()
    expect(calculateAffix({ ...rect, top: 20 }, target, {})).toBeUndefined()
    expect(calculateAffix({ ...rect, top: 19 }, target, {})).toEqual({ top: 20, left: 40, width: 200, height: 50, relativeTop: 1 })
  })
  it('resolves a top offset in the target viewport', () => {
    expect(calculateAffix({ ...rect, top: -30 }, target, { offsetTop: 12 })).toMatchObject({ top: 32, relativeTop: 62 })
  })
  it('pins bottom content until its original location becomes visible', () => {
    expect(calculateAffix({ ...rect, top: 500 }, target, { offsetBottom: 12 })).toMatchObject({ top: 338, relativeTop: -162 })
    expect(calculateAffix({ ...rect, top: 338 }, target, { offsetBottom: 12 })).toBeUndefined()
  })
  it('gives explicit top priority when both offsets are set', () => {
    expect(calculateAffix({ ...rect, top: 0 }, target, { offsetTop: 0, offsetBottom: 50 })?.top).toBe(20)
    expect(calculateAffix({ ...rect, top: 500 }, target, { offsetTop: 0, offsetBottom: 50 })).toBeUndefined()
  })
  it('does not pin disabled, hidden, empty-target or invalid-offset content', () => {
    expect(calculateAffix(rect, target, { disabled: true, offsetBottom: 0 })).toBeUndefined()
    expect(calculateAffix({ ...rect, width: 0 }, target, { offsetBottom: 0 })).toBeUndefined()
    expect(calculateAffix(rect, { top: 10, bottom: 10 }, {})).toBeUndefined()
    expect(calculateAffix(rect, target, { offsetTop: Infinity })).toBeUndefined()
  })
})
