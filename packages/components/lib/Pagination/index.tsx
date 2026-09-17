import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, merge, createMemo, createSignal } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createPagination } from 'upthrust-competence'
import Dropdown from '../Dropdown'
import {
  paginationContainerClass, paginationItemClass, paginationEllipsisClass,
  paginationJumperClass, paginationTotalClass, paginationSizeChangerClass,
} from './styles'
import { twMerge } from 'tailwind-merge'

export interface PaginationProps {
  current?: number
  defaultCurrent?: number
  total: number
  pageSize?: number
  defaultPageSize?: number
  /** Page-size selector options; enables the selector when provided. */
  pageSizeOptions?: number[]
  showQuickJumper?: boolean
  showTotal?: (total: number, range: [number, number]) => JSX.Element
  onChange?: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
  disabled?: boolean
  hideOnSinglePage?: boolean
  size?: 'default' | 'small'
  align?: 'start' | 'center' | 'end'
  class?: string
  style?: JSX.CSSProperties
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

const Pagination: Component<PaginationProps> = (providedProps) => {
  const rawProps = useComponentProps('Pagination', providedProps)
  const props = merge(
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
    get onShowSizeChange() { return props.onShowSizeChange },
    get disabled() { return props.disabled },
  })

  const [jumperValue, setJumperValue] = createSignal('')

  const shouldHide = createMemo(() => props.hideOnSinglePage && pagination.totalPages() <= 1)

  // Size changer shows when pageSizeOptions is provided OR total is large
  // (enabled by default above 50 total — keep it explicit here:
  // shown when pageSizeOptions is a non-empty array).
  const sizeOptions = createMemo(() => {
    if (props.disabled) return []
    return props.pageSizeOptions?.length ? props.pageSizeOptions : []
  })
  const showSizeChanger = createMemo(() => sizeOptions().length > 0)

  const handleJumper = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      const page = parseInt(jumperValue())
      if (!isNaN(page)) {
        pagination.goTo(page)
        setJumperValue('')
      }
    }
  }

  const navState = (enabled: boolean) => (enabled ? 'idle' : 'nav-disabled') as
    'idle' | 'nav-disabled'

  return (
    <Show when={!shouldHide()}>
      <nav class={twMerge(paginationContainerClass({ align: props.align }), props.class)} style={props.style}>
        <Show when={props.showTotal}>
          <span class={paginationTotalClass({})}>
            {props.showTotal!(props.total, pagination.itemRange())}
          </span>
        </Show>

        <button
          class={paginationItemClass({ state: navState(pagination.hasPrev() && !props.disabled), size: props.size })}
          onClick={() => pagination.prev()}
          disabled={!pagination.hasPrev() || props.disabled}
          aria-label="Previous Page"
        >
          <span class="i-mdi-chevron-left text-lg" />
        </button>

        <For each={pagination.pageRange()}>
          {(item) => (
            <Show
              when={typeof item === 'number'}
              fallback={
                <span class={paginationEllipsisClass({ size: props.size })} />
              }
            >
              <button
                class={paginationItemClass({
                  state: item === pagination.current()
                    ? (props.disabled ? 'active-disabled' : 'active')
                    : navState(!props.disabled),
                  size: props.size,
                })}
                onClick={() => pagination.goTo(item as number)}
                disabled={props.disabled}
                aria-current={item === pagination.current() ? 'page' : undefined}
              >
                {item}
              </button>
            </Show>
          )}
        </For>

        <button
          class={paginationItemClass({ state: navState(pagination.hasNext() && !props.disabled), size: props.size })}
          onClick={() => pagination.next()}
          disabled={!pagination.hasNext() || props.disabled}
          aria-label="Next Page"
        >
          <span class="i-mdi-chevron-right text-lg" />
        </button>

        <Show when={showSizeChanger()}>
          <Dropdown
            trigger="click"
            placement="topRight"
            menu={{
              items: sizeOptions().map((size) => ({
                key: String(size),
                label: `${size} 条/页`,
              })),
              onClick: (key: string) => pagination.changePageSize(parseInt(key)),
            }}
          >
            <button class={paginationSizeChangerClass({ size: props.size, disabled: props.disabled })}>
              {pagination.pageSize()} 条/页
              <span class="i-mdi-chevron-down text-sm opacity-60" />
            </button>
          </Dropdown>
        </Show>

        <Show when={props.showQuickJumper}>
          <span class="text-sm text-on-surface-variant ml-[8px]">
            跳至
            <input
              type="text"
              class={paginationJumperClass({ size: props.size, disabled: props.disabled })}
              style={{ display: 'inline-block', margin: '0 8px' }}
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
