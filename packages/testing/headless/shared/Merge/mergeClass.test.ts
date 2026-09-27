import { describe, expect, it } from 'vitest'
import { mergeClass } from '../../../../components/common/merge'

describe('mergeClass', () => {
  // 关键回归：默认 twMerge 不认识 preset 间距档位，my-lg my-0 会原样保留两者；mergeClass 让后者覆盖前者。
  it('[merge.spacing] preset spacing tokens conflict with numeric spacing', () => {
    expect(mergeClass('my-lg my-0')).toBe('my-0')
    expect(mergeClass('gap-xs gap-4')).toBe('gap-4')
    expect(mergeClass('p-md p-xxs')).toBe('p-xxs')
    expect(mergeClass('px-sm px-[20px]')).toBe('px-[20px]')
  })

  // 关键回归：默认 twMerge 把 text-body 当文字颜色，与 text-on-surface 互相吞掉；mergeClass 把它识别为字号。
  it('[merge.text] text-* size tokens no longer swallow text colors', () => {
    expect(mergeClass('text-on-surface text-body')).toBe('text-on-surface text-body')
    expect(mergeClass('text-body-lg text-body')).toBe('text-body')
    expect(mergeClass('text-heading-1 text-sm')).toBe('text-sm')
  })

  // 不同方向与不同属性仍各自保留，不会误合并。
  it('[merge.keep] unrelated classes survive', () => {
    expect(mergeClass('mx-xs my-lg')).toBe('mx-xs my-lg')
    expect(mergeClass('gap-x-md gap-y-lg')).toBe('gap-x-md gap-y-lg')
    expect(mergeClass('text-body text-primary font-medium')).toBe('text-body text-primary font-medium')
  })

  // 与 twMerge 相同的签名：忽略 falsy 参数，接受多段参数。
  it('[merge.args] ignores falsy arguments', () => {
    expect(mergeClass('flex', undefined, null, false, '', 'my-lg', 'my-0')).toBe('flex my-0')
  })
})
