import { useComponentProps } from '../ConfigProvider/context'
import { For, Show, createEffect } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import { createTransfer, type TransferConfig, type TransferItem, type TransferDirection } from 'upthrust-competence'
import { useFormItem } from '../Input/context'
import { transferPanelClass, transferRowClass, transferActionClass, transferCheckboxClass } from './styles'

export type { TransferItem, TransferKey, TransferDirection } from 'upthrust-competence'
export interface TransferProps<T extends TransferItem = TransferItem> extends TransferConfig<T> {
  titles?: [string, string]
  operations?: [JSX.Element, JSX.Element]
  showSearch?: boolean
  showSelectAll?: boolean
  searchPlaceholder?: string
  notFoundContent?: JSX.Element
  render?: (item: T) => JSX.Element
  footer?: (direction: TransferDirection) => JSX.Element
  listStyle?: JSX.CSSProperties
  status?: 'error' | 'warning'
  id?: string
  class?: string
  style?: JSX.CSSProperties
}

const Transfer = <T extends TransferItem = TransferItem>(providedProps: TransferProps<T>) => {
  const props = useComponentProps('Transfer', providedProps)
  const form = useFormItem({
    get value() { return props.targetKeys },
    get disabled() { return props.disabled },
    get status() { return props.status },
    get id() { return props.id },
  })
  const machine = createTransfer<T>({
    get dataSource() { return props.dataSource },
    get targetKeys() { return form.value() as TransferProps<T>['targetKeys'] },
    get defaultTargetKeys() { return props.defaultTargetKeys },
    get selectedKeys() { return props.selectedKeys },
    get defaultSelectedKeys() { return props.defaultSelectedKeys },
    get disabled() { return form.disabled() },
    get oneWay() { return props.oneWay },
    get filterOption() { return props.filterOption },
    get onSelectChange() { return props.onSelectChange },
    get onSearch() { return props.onSearch },
    onChange: (keys, direction, moved) => { form.onChange(keys); props.onChange?.(keys, direction, moved) },
  })
  const title = (direction: TransferDirection) => props.titles?.[direction === 'left' ? 0 : 1] ?? (direction === 'left' ? '待选项' : '已选项')
  const Panel = (p: { direction: TransferDirection }) => {
    const state = () => machine.selectionState(p.direction)
    let allCheckbox: HTMLInputElement | undefined
    createEffect(() => state().indeterminate, value => { if (allCheckbox) allCheckbox.indeterminate = value })
    const removable = () => props.oneWay && p.direction === 'right'
    return <section class={transferPanelClass({ status: form.status() ?? 'default' })} style={props.listStyle} aria-label={title(p.direction)}>
      <div class="flex items-center gap-2 px-3 h-[40px] shrink-0 border-b border-solid border-outline-variant text-[14px]">
        <Show when={props.showSelectAll !== false && !removable()}>
          <input type="checkbox" class={transferCheckboxClass} ref={el => { allCheckbox = el }} checked={state().checked}
            aria-checked={state().indeterminate ? 'mixed' : state().checked ? 'true' : 'false'} disabled={state().disabled || form.disabled()}
            aria-label={`全选${title(p.direction)}`} onChange={e => {
              const previous = state()
              machine.selectAll(p.direction, e.currentTarget.checked)
              e.currentTarget.checked = previous.checked
              e.currentTarget.indeterminate = previous.indeterminate
            }} />
        </Show>
        <span class="flex-1">{title(p.direction)}</span>
        <span class="text-on-surface-variant text-[12px]">{machine.selectedIn(p.direction).length} / {machine.items(p.direction).length}</span>
      </div>
      <Show when={props.showSearch}>
        <div class="p-2 shrink-0">
          <input type="search" class="w-full box-border h-[28px] px-2 rounded-sm border border-solid border-outline-variant bg-transparent text-[12px] text-on-surface focus:outline-primary"
            placeholder={props.searchPlaceholder ?? '请输入搜索内容'} aria-label={`搜索${title(p.direction)}`}
            value={machine.searchValue(p.direction)} disabled={form.disabled()} onInput={e => machine.setSearch(p.direction, e.currentTarget.value)} />
        </div>
      </Show>
      <ul class="flex-1 min-h-0 overflow-auto m-0 p-0 list-none" aria-label={title(p.direction)}>
        <For each={machine.filteredItems(p.direction)} fallback={<li class="px-3 py-8 text-center text-[14px] text-on-surface-variant">{props.notFoundContent ?? '暂无数据'}</li>}>
          {item => <li class={transferRowClass({ selected: machine.isSelected(item.key), disabled: machine.isDisabled(item.key) })}>
            <Show when={removable()} fallback={
              <label class="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
                <input type="checkbox" class={transferCheckboxClass} checked={machine.isSelected(item.key)} disabled={machine.isDisabled(item.key)}
                  aria-label={item.title} onChange={e => {
                    const previous = machine.isSelected(item.key)
                    machine.toggleSelect(item.key)
                    e.currentTarget.checked = previous
                  }} />
                <span class="truncate" title={item.description ?? item.title}>{props.render?.(item) ?? item.title}</span>
              </label>
            }>
              <span class="flex-1 truncate">{props.render?.(item) ?? item.title}</span>
              <button type="button" class="inline-flex p-1 rounded-sm border-0 bg-transparent text-on-surface-variant cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary"
                aria-label={`移除 ${item.title}`} disabled={machine.isDisabled(item.key)} onClick={() => machine.remove(item.key)}>
                <span class="i-mdi-close" aria-hidden="true" />
              </button>
            </Show>
          </li>}
        </For>
      </ul>
      <Show when={props.footer}><div class="px-3 py-2 border-t border-solid border-outline-variant text-[12px]">{props.footer?.(p.direction)}</div></Show>
    </section>
  }
  return <div id={form.id()} class={twMerge('inline-flex items-center gap-3 max-w-full overflow-x-auto', props.class)} style={props.style} role="group" aria-label="穿梭框" aria-disabled={form.disabled() ? 'true' : 'false'}>
    <Panel direction="left" />
    <div class="flex flex-col gap-2 shrink-0">
      <button type="button" class={transferActionClass} aria-label="移入右侧" disabled={machine.movableKeys('right').length === 0} onClick={() => machine.move('right')}>
        {props.operations?.[0]}<span class="i-mdi-chevron-right" aria-hidden="true" />
      </button>
      <Show when={!props.oneWay}>
        <button type="button" class={transferActionClass} aria-label="移回左侧" disabled={machine.movableKeys('left').length === 0} onClick={() => machine.move('left')}>
          <span class="i-mdi-chevron-left" aria-hidden="true" />{props.operations?.[1]}
        </button>
      </Show>
    </div>
    <Panel direction="right" />
  </div>
}
export default Transfer
