import { createMemo, createSignal } from "solid-js";

export type PaginationConfig = {
  current?: number
  defaultCurrent?: number
  total: number
  pageSize?: number
  defaultPageSize?: number
  onChange?: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
  disabled?: boolean
}

export type PaginationIns = {
  current: () => number
  pageSize: () => number
  goTo: (page: number) => void
  next: () => void
  prev: () => void
}

/** Page token in the rendered pager: a page number or an ellipsis marker. */
export type PageItem = number | 'prev-ellipsis' | 'next-ellipsis'

export const createPagination = (config: PaginationConfig) => {
  // ownedWrite: goTo/changePageSize are imperative APIs fired from event
  // handlers, not template computations.
  const [_current, _setCurrent] = createSignal(config.defaultCurrent ?? 1, { ownedWrite: true })
  const [_pageSize, _setPageSize] = createSignal(config.defaultPageSize ?? 10, { ownedWrite: true })

  const current = createMemo(() => config.current !== undefined ? config.current : _current())
  const pageSize = createMemo(() => config.pageSize !== undefined ? config.pageSize : _pageSize())
  const totalPages = createMemo(() => Math.max(1, Math.ceil(config.total / pageSize())))

  const hasPrev = createMemo(() => current() > 1)
  const hasNext = createMemo(() => current() < totalPages())

  /**
   * Standard pager (rc-pagination semantics): middle pages show a 3-wide
   * window around `cur`; within 4 pages of an edge the window widens to 5
   * consecutive numbers (cur ≤ 4 → 1..5 … n; cur ≥ n-3 → 1 … n-4..n).
   * Fewer than 8 pages render all numbers.
   */
  const pageRange = createMemo((): PageItem[] => {
    const total = totalPages()
    const cur = current()
    const range: PageItem[] = []

    if (total <= 7) {
      for (let i = 1; i <= total; i++) range.push(i)
      return range
    }

    range.push(1)

    let start: number
    let end: number
    if (cur <= 4) {
      start = 2
      end = 5
    } else if (cur >= total - 3) {
      start = total - 4
      end = total - 1
    } else {
      start = cur - 1
      end = cur + 1
    }

    if (start > 2) {
      range.push('prev-ellipsis')
    }

    for (let i = start; i <= end; i++) {
      range.push(i)
    }

    if (end < total - 1) {
      range.push('next-ellipsis')
    }

    range.push(total)

    return range
  })

  // ---- Table-ready slice API ---------------------------------------------
  // The one integration a data component (Table/List) needs: which rows of
  // the source array are on the current page. Derived entirely from the
  // reactive state above, so it stays correct through controlled updates,
  // pageSize changes and total changes.

  /** Zero-based index of the first row on the current page. */
  const offset = createMemo(() => (current() - 1) * pageSize())

  /** [start, end) half-open range of source-array indices on this page. */
  const rangeFor = createMemo((): [number, number] => {
    const start = Math.min(offset(), Math.max(0, config.total))
    const end = Math.min(start + pageSize(), Math.max(0, config.total))
    return [start, end]
  })

  /** Slice of a source array for the current page (generic, length-safe). */
  const slice = <T,>(items: readonly T[]): T[] => {
    const [start, end] = rangeFor()
    return items.slice(start, end) as T[]
  }

  /** [firstItem, lastItem] 1-based display range — feeds showTotal. */
  const itemRange = createMemo((): [number, number] => {
    if (config.total <= 0) return [0, 0]
    const [start, end] = rangeFor()
    return [start + 1, end]
  })

  const goTo = (page: number) => {
    if (config.disabled) return
    const clamped = Math.max(1, Math.min(page, totalPages()))
    if (clamped === current()) return
    _setCurrent(clamped)
    config.onChange?.(clamped, pageSize())
  }

  const prev = () => { if (hasPrev()) goTo(current() - 1) }
  const next = () => { if (hasNext()) goTo(current() + 1) }

  const changePageSize = (size: number) => {
    if (config.disabled || size === pageSize()) return
    const maxPage = Math.max(1, Math.ceil(config.total / size))
    const newCur = Math.min(current(), maxPage)
    _setPageSize(size)
    _setCurrent(newCur)
    config.onShowSizeChange?.(newCur, size)
    // fires onChange too when size change moves the page.
    config.onChange?.(newCur, size)
  }

  const refs: PaginationIns = {
    current,
    pageSize,
    goTo,
    next,
    prev
  }

  return {
    current,
    pageSize,
    totalPages,
    pageRange,
    hasPrev,
    hasNext,
    goTo,
    prev,
    next,
    changePageSize,
    // Table-ready slice API
    offset,
    rangeFor,
    slice,
    itemRange,
    refs
  }
}

export const paginationSplits: (keyof PaginationConfig)[] = ['current', 'defaultCurrent', 'total', 'pageSize', 'defaultPageSize', 'onChange', 'onShowSizeChange', 'disabled']
