import { Component, JSX, For, Show, mergeProps, createMemo, createSignal } from 'solid-js'
import { createPagination } from 'upthrust-competence'
import { paginationContainerClass, paginationItemClass, paginationEllipsisClass } from './styles'
import { twMerge } from 'tailwind-merge'

export interface PaginationProps {
  current?: number
  defaultCurrent?: number
  total: number
  pageSize?: number
  defaultPageSize?: number
  showQuickJumper?: boolean
  showTotal?: (total: number, range: [number, number]) => JSX.Element
  onChange?: (page: number, pageSize: number) => void
  disabled?: boolean
  hideOnSinglePage?: boolean
  size?: 'default' | 'small'
  align?: 'start' | 'center' | 'end'
  class?: string
  style?: JSX.CSSProperties
}

const Pagination: Component<PaginationProps> = (rawProps) => {
  const props = mergeProps(
    { size: 'default' as const, align: 'start' as const, total: 0 },
    rawProps
  )

  const pagination = createPagination({
    get current() { return props.current },
    get defaultCurrent() { return props.defaultCurrent },
    get total() { return props.total },
    get pageSize() { return props.pageSize },
    get defaultPageSize() { return props.defaultPageSize },
    get onChange() { return props.onChange },
    get disabled() { return props.disabled },
  })

  const [jumperValue, setJumperValue] = createSignal('')

  const shouldHide = createMemo(() => props.hideOnSinglePage && pagination.totalPages() <= 1)

  const handleJumper = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      const page = parseInt(jumperValue())
      if (!isNaN(page)) {
        pagination.goTo(page)
        setJumperValue('')
      }
    }
  }

  return (
    <Show when={!shouldHide()}>
      <nav class={twMerge(paginationContainerClass({ align: props.align }), props.class)} style={props.style}>
        <Show when={props.showTotal}>
          <span class="text-sm text-on-surface-variant mr-2">
            {props.showTotal!(props.total, [
              (pagination.current() - 1) * pagination.pageSize() + 1,
              Math.min(pagination.current() * pagination.pageSize(), props.total)
            ])}
          </span>
        </Show>

        <button
          class={paginationItemClass({ disabled: !pagination.hasPrev() || props.disabled, size: props.size })}
          onClick={() => pagination.prev()}
          disabled={!pagination.hasPrev() || props.disabled}
        >
          <span class="i-mdi-chevron-left text-lg" />
        </button>

        <For each={pagination.pageRange()}>
          {(item) => (
            <Show
              when={typeof item === 'number'}
              fallback={
                <span class={paginationEllipsisClass({ size: props.size })}>
                  <span class="i-mdi-dots-horizontal" />
                </span>
              }
            >
              <button
                class={paginationItemClass({ active: item === pagination.current(), disabled: props.disabled, size: props.size })}
                onClick={() => pagination.goTo(item as number)}
                disabled={props.disabled}
              >
                {item}
              </button>
            </Show>
          )}
        </For>

        <button
          class={paginationItemClass({ disabled: !pagination.hasNext() || props.disabled, size: props.size })}
          onClick={() => pagination.next()}
          disabled={!pagination.hasNext() || props.disabled}
        >
          <span class="i-mdi-chevron-right text-lg" />
        </button>

        <Show when={props.showQuickJumper}>
          <span class="text-sm text-on-surface-variant ml-2">
            跳至
            <input
              type="text"
              class="w-12 h-7 mx-1 text-center border border-outline/30 rounded text-sm outline-none focus:border-primary"
              value={jumperValue()}
              onInput={(e) => setJumperValue(e.currentTarget.value)}
              onKeyDown={handleJumper}
              disabled={props.disabled}
            />
            页
          </span>
        </Show>
      </nav>
    </Show>
  )
}

export default Pagination
