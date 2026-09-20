import { useComponentProps } from '../ConfigProvider/context'
import { Component, Show, createMemo } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import Button from '../Button'
import Input, { type InputProps } from './index'
import { useFormItem } from './context'

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

  const form = useFormItem({
    get value() { return props.value },
    get onChange() { return props.onChange },
    get disabled() { return props.disabled },
    get size() { return props.size },
  })
  let inputEl: HTMLInputElement | undefined
  const blocked = () => !!form.disabled() || !!props.loading
  const handleChange = (value: string, event?: Event) => {
    form.onChange(value, event)
    if (!blocked() && value === '' && (event?.type === 'click' || event?.type === 'keydown')) {
      props.onSearch?.('', event as MouseEvent | KeyboardEvent, { source: 'clear' })
    }
  }
  const triggerSearch = (event: MouseEvent | KeyboardEvent) => {
    if (blocked() || (event instanceof KeyboardEvent && (event.isComposing || event.keyCode === 229))) return
    props.onSearch?.(inputEl?.value ?? String(form.value() ?? ''), event, { source: 'input' })
  }

  const enterButton = createMemo(() => props.enterButton)

  const searchBtn = (
    <Show
      when={enterButton()}
      fallback={
        <button
          type="button"
          aria-label="搜索"
          disabled={blocked()}
          class={twMerge(
            'border-0 bg-transparent p-0 disabled:cursor-not-allowed',
            'flex', 'items-center', 'justify-center', 'h-full',
            'px-[7px]',
            'cursor-pointer', 'select-none',
            'text-on-surface/45', 'transition-upthrust-fast', 'hover:text-primary',
          )}
          onClick={triggerSearch}
        >
          <Show
            when={!props.loading}
            fallback={<span class="i-mdi-loading animate-spin text-[14px]" />}
          >
            <span class="i-mdi-magnify text-[14px]" />
          </Show>
        </button>
      }
    >
      <Button
        variant="solid"
        color="primary"
        aria-label="搜索"
        size={props.size ?? form.size()}
        disabled={form.disabled()}
        loading={props.loading}
        icon={enterButton() === true ? <span class="i-mdi-magnify text-[14px]" /> : undefined}
        onClick={e => triggerSearch(e)}
      >
        {enterButton() === true ? undefined : enterButton() as JSX.Element}
      </Button>
    </Show>
  )

  return (
    <span class="inline-flex items-stretch w-full">
      <Input
        {...props}
        ref={el => { inputEl = el; props.ref?.(el) }}
        onChange={handleChange}
        onPressEnter={triggerSearch}
        class={enterButton()
          ? twMerge(
              // Grouped with a trailing button: square the frame's right
              // corners — the button owns them; the shared 1px border
              // collapses via the button's -ml-px. `!rounded-r-none` covers
              // affix mode (border on the root span), the [&>input] variant
              // covers bare mode (border on the input itself). The z hooks
              // keep the focus ring above the button.
              props.class, '!rounded-r-none',
              '[&>input]:!rounded-r-none',
              'focus-within:z-[1]',
              '[&>input]:focus:z-[1]',
            )
          : props.class}
        suffix={enterButton() ? props.suffix : <>{props.suffix}{searchBtn}</>}
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
