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

export const createPagination = (config: PaginationConfig) => {
  const [_current, _setCurrent] = createSignal(config.defaultCurrent ?? 1)
  const [_pageSize, _setPageSize] = createSignal(config.defaultPageSize ?? 10)

  const current = createMemo(() => config.current !== undefined ? config.current : _current())
  const pageSize = createMemo(() => config.pageSize !== undefined ? config.pageSize : _pageSize())
  const totalPages = createMemo(() => Math.max(1, Math.ceil(config.total / pageSize())))

  const hasPrev = createMemo(() => current() > 1)
  const hasNext = createMemo(() => current() < totalPages())

  const pageRange = createMemo(() => {
    const total = totalPages()
    const cur = current()
    const range: (number | 'prev-ellipsis' | 'next-ellipsis')[] = []

    if (total <= 7) {
      for (let i = 1; i <= total; i++) range.push(i)
      return range
    }

    range.push(1)

    if (cur > 3) {
      range.push('prev-ellipsis')
    }

    const start = Math.max(2, cur - 1)
    const end = Math.min(total - 1, cur + 1)

    for (let i = start; i <= end; i++) {
      range.push(i)
    }

    if (cur < total - 2) {
      range.push('next-ellipsis')
    }

    range.push(total)

    return range
  })

  const goTo = (page: number) => {
    if (config.disabled) return
    const clamped = Math.max(1, Math.min(page, totalPages()))
    _setCurrent(clamped)
    config.onChange?.(clamped, pageSize())
  }

  const prev = () => { if (hasPrev()) goTo(current() - 1) }
  const next = () => { if (hasNext()) goTo(current() + 1) }

  const changePageSize = (size: number) => {
    _setPageSize(size)
    const maxPage = Math.max(1, Math.ceil(config.total / size))
    const newCur = Math.min(current(), maxPage)
    _setCurrent(newCur)
    config.onShowSizeChange?.(newCur, size)
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
    refs
  }
}

export const paginationSplits: (keyof PaginationConfig)[] = ['current', 'defaultCurrent', 'total', 'pageSize', 'defaultPageSize', 'onChange', 'onShowSizeChange', 'disabled']
