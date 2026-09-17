import { useComponentProps } from '../ConfigProvider/context'
import { Component, Show, createMemo, createSignal } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import Button from '../Button'
import Input, { type InputProps } from './index'

export interface SearchProps extends Omit<InputProps, 'onPressEnter'> {
  /** Callback on search (Enter key, clear button, or search button). */
  onSearch?: (value: string, event?: MouseEvent | KeyboardEvent, info?: { source: 'input' | 'clear' }) => void
  /** Render a primary button with the given label instead of the bare icon. */
  enterButton?: JSX.Element | boolean
  loading?: boolean
}

/**
 * Input.Search — antd-aligned search input.
 *
 * Two modes (antd):
 *  - default: a magnify icon sits in the suffix slot (px-[7px] hit area;
 *    with the 4px affix gap this yields the symmetric 11px text↔frame
 *    spacing), Enter / click both fire onSearch.
 *  - enterButton: the input frame squares off its RIGHT corners and a
 *    PRIMARY button (squared LEFT corners) joins it via -ml-px — a single
 *    shared 1px divider, exactly antd's bordered group. Custom labels and
 *    the bare magnify button both use variant solid + color primary.
 */
const Search: Component<SearchProps> = providedProps => {
  const rawProps = useComponentProps('Search', providedProps)
  const props = rawProps

  const [innerValue, setInnerValue] = createSignal(props.defaultValue ?? '')
  const value = () => (props.value !== undefined ? props.value : innerValue())

  const [composing, setComposing] = createSignal(false)

  const handleChange = (v: string, e?: Event) => {
    setInnerValue(v)
    if (props.onChange) {
      props.onChange(v, e)
      return
    }
    // Clear-initiated change: report as a search (antd source: 'clear').
    if (e && e.type === 'click' && v === '') {
      props.onSearch?.(v, e as MouseEvent, { source: 'clear' })
    }
  }

  const triggerSearch = (e: MouseEvent | KeyboardEvent) => {
    props.onSearch?.(value(), e, { source: 'input' })
  }

  const handlePressEnter = (e: KeyboardEvent) => {
    if (composing()) return
    triggerSearch(e)
  }

  const enterButton = createMemo(() => props.enterButton)

  const searchBtn = (
    <Show
      when={enterButton()}
      fallback={
        <span
          class={twMerge(
            'flex', 'items-center', 'justify-center', 'h-full',
            'px-[7px]',
            'cursor-pointer', 'select-none',
            'text-on-surface/45', 'transition-upthrust-fast', 'hover:text-primary',
          )}
          onClick={e => { if (!props.disabled && !props.loading) triggerSearch(e) }}
        >
          <Show
            when={!props.loading}
            fallback={<span class="i-mdi-loading animate-spin text-[14px]" />}
          >
            <span class="i-mdi-magnify text-[14px]" />
          </Show>
        </span>
      }
    >
      <Button
        variant="solid"
        color="primary"
        size={props.size}
        disabled={props.disabled}
        loading={props.loading}
        onClick={e => triggerSearch(e)}
      >
        <Show when={enterButton() === true} fallback={enterButton() as JSX.Element}>
          <span class="i-mdi-magnify text-[14px]" />
        </Show>
      </Button>
    </Show>
  )

  return (
    <span class="inline-flex items-stretch w-full">
      <Input
        {...props}
        value={value()}
        onChange={handleChange}
        onPressEnter={handlePressEnter}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
        class={enterButton()
          ? twMerge(
              // Grouped with a trailing button: square the frame's right
              // corners — the button owns them; the shared 1px border
              // collapses via the button's -ml-px. `!rounded-r-none` covers
              // affix mode (border on the root span), the [&>input] variant
              // covers bare mode (border on the input itself). The z hooks
              // keep the focus ring above the button.
              '!rounded-r-none',
              '[&>input]:!rounded-r-none',
              'focus-within:z-[1]',
              '[&>input]:focus:z-[1]',
            )
          : undefined}
        suffix={enterButton() ? undefined : searchBtn}
      />
      <Show when={enterButton()}>
        <span class="inline-flex shrink-0 -ml-px items-center [&>button]:!rounded-l-none">
          {searchBtn}
        </span>
      </Show>
    </span>
  )
}

export default Search
