import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { createSkeleton, skeletonBlocks } from './skeleton'

describe('skeletonBlocks (pure)', () => {
  it('derives default title + 3 paragraph rows', () => {
    const blocks = skeletonBlocks({})
    expect(blocks).toHaveLength(4)
    expect(blocks[0]).toEqual({ kind: 'title', width: undefined })
    expect(blocks.slice(1).every(b => b.kind === 'paragraph')).toBe(true)
  })

  it('respects paragraph.rows and per-row widths', () => {
    const blocks = skeletonBlocks({
      paragraph: { rows: 2, width: [100, '50%'] },
    })
    expect(blocks).toHaveLength(3)
    expect(blocks[1].width).toBe(100)
    expect(blocks[2].width).toBe('50%')
  })

  it('disables title/paragraph with false', () => {
    expect(skeletonBlocks({ title: false, paragraph: false })).toHaveLength(0)
    expect(skeletonBlocks({ title: false }).every(b => b.kind === 'paragraph')).toBe(true)
    expect(skeletonBlocks({ paragraph: false })[0].kind).toBe('title')
  })

  it('title width override applies', () => {
    const blocks = skeletonBlocks({ title: { width: '80%' }, paragraph: false })
    expect(blocks[0].width).toBe('80%')
  })
})

describe('createSkeleton', () => {
  it('loading defaults true and tracks the prop', () => {
    const [loading, setLoading] = createSignal(true, { ownedWrite: true })
    createRoot((dispose) => {
      const sk = createSkeleton({ get loading() { return loading() } })
      flush()
      expect(sk.loading()).toBe(true)
      setLoading(false)
      sk.loading()
      flush()
      expect(sk.loading()).toBe(false)
      dispose()
    })
  })
})
