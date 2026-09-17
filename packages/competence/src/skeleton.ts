import { createMemo } from "solid-js";

/**
 * Headless logic for Skeleton — derives the block list from a compact
 * props shape so the UI layer only renders. Handles:
 *  - `loading` flipping (false renders real content instead)
 *  - rows/paragraph composition: antd maps `paragraph`/`title` booleans or
 *    overrides into a list of widths; here the derivation is pure.
 */

export type SkeletonBlock = {
  /** Distinguishes title spacing from paragraph spacing. */
  kind: 'title' | 'paragraph'
  /** Numbers are pixels, strings are CSS lengths; undefined fills the column. */
  width?: number | string
}

export type SkeletonConfig = {
  loading?: boolean
  active?: boolean
  /** Round title and paragraph line ends; avatar uses its own shape. */
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

  const blocks = createMemo(() => skeletonBlocks(config))

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
    const requestedRows = paragraph === true || paragraph === undefined ? 3 : paragraph.rows ?? 3
    const rows = Number.isFinite(requestedRows) ? Math.max(0, Math.floor(requestedRows)) : 0
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
