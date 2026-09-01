import { createMemo } from "solid-js";

/**
 * Headless logic for Skeleton — derives the block list from a compact
 * props shape so the UI layer only renders. Handles:
 *  - `loading` flipping (false renders real content instead)
 *  - rows/paragraph composition: antd maps `paragraph`/`title` booleans or
 *    overrides into a list of widths; here the derivation is pure.
 */

export type SkeletonBlock = {
  /** 'title' | 'paragraph' rows have different heights. */
  kind: 'title' | 'paragraph'
  /** Width in px; undefined = full width. Last paragraph row is ~60%. */
  width?: number | string
}

export type SkeletonConfig = {
  loading?: boolean
  active?: boolean
  /** Round line ends (avatar stays round regardless). */
  round?: boolean
  title?: boolean | { width?: number | string }
  paragraph?: boolean | { rows?: number; width?: number | string | Array<number | string> }
  avatar?: boolean | { size?: number | string; shape?: 'circle' | 'square' }
}

export type SkeletonIns = {
  loading: () => boolean
}

export const createSkeleton = (config: SkeletonConfig = {}) => {
  const loading = createMemo(() => config.loading ?? true)

  /**
   * Derive the skeleton block list. Pure — exported for tests.
   * Layout order follows antd: avatar (if any) on the left, then
   * title + paragraph column on the right.
   */
  const blocks = createMemo((): SkeletonBlock[] => {
    const out: SkeletonBlock[] = []
    const title = config.title
    if (title !== false) {
      out.push({ kind: 'title', width: title === true || title === undefined ? undefined : title.width })
    }
    const paragraph = config.paragraph
    if (paragraph !== false) {
      const rows = paragraph === true || paragraph === undefined ? 3
        : paragraph.rows ?? 3
      const widths = paragraph && paragraph !== true && Array.isArray(paragraph.width)
        ? paragraph.width
        : undefined
      const singleWidth = paragraph && paragraph !== true && !Array.isArray(paragraph.width)
        ? paragraph.width
        : undefined
      for (let i = 0; i < rows; i++) {
        const w = widths?.[i] ?? singleWidth
        out.push({ kind: 'paragraph', width: w })
      }
    }
    return out
  })

  const refs: SkeletonIns = { loading }

  return { loading, blocks, refs }
}

/** Skeleton block list derivation, exported pure for tests. */
export const skeletonBlocks = (config: SkeletonConfig): SkeletonBlock[] => {
  const title = config.title
  const out: SkeletonBlock[] = []
  if (title !== false) {
    out.push({ kind: 'title', width: title === true || title === undefined ? undefined : title.width })
  }
  const paragraph = config.paragraph
  if (paragraph !== false) {
    const rows = paragraph === true || paragraph === undefined ? 3 : paragraph.rows ?? 3
    const widths = paragraph && paragraph !== true && Array.isArray(paragraph.width) ? paragraph.width : undefined
    const singleWidth = paragraph && paragraph !== true && !Array.isArray(paragraph.width) ? paragraph.width : undefined
    for (let i = 0; i < rows; i++) {
      out.push({ kind: 'paragraph', width: widths?.[i] ?? singleWidth })
    }
  }
  return out
}

export const skeletonSplits: (keyof SkeletonConfig)[] = [
  'loading', 'active', 'round', 'title', 'paragraph', 'avatar',
]
