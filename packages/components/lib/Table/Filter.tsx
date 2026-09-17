import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
// @unocss-include
import { createSignal, createEffect, For, Show } from 'solid-js'
import type { TableFilterItem, TableFilterValue, TableIns } from 'upthrust-competence'
import type { TableColumnType } from './types'
import { tableActionClass, tableInputClass, tableFilterIconClass } from './styles'

export function TableFilter<T>(props: { column: TableColumnType<T>; id: string; table: TableIns<T>; disabled?: boolean }) {
  const [open, setOpen] = createSignal(false)
  const [draft, setDraft] = createSignal<readonly TableFilterValue[]>([])
  const [query, setQuery] = createSignal('')
  let root!: HTMLDivElement, trigger!: HTMLButtonElement, panel: HTMLDivElement | undefined
  const [position, setPosition] = createSignal({ top: 0, left: 0 }, { ownedWrite: true })
  const active = () => props.table.getState().filters[props.id] ?? []
  const close = () => { setOpen(false); trigger.focus() }
  createEffect(open, value => {
    if (!value) return
    const outside = (e: PointerEvent) => { if (!root.contains(e.target as Node) && !panel?.contains(e.target as Node)) setOpen(false) }
    const place = () => {
      const rect = trigger.getBoundingClientRect(), height = panel?.getBoundingClientRect().height ?? 260
      setPosition({ left: Math.max(8, Math.min(rect.right - 220, window.innerWidth - 228)), top: rect.bottom + height + 8 <= window.innerHeight ? rect.bottom + 4 : Math.max(8, rect.top - height - 4) })
    }
    place(); panel?.querySelector<HTMLInputElement>('input')?.focus()
    window.addEventListener('scroll', place, true); window.addEventListener('resize', place)
    document.addEventListener('pointerdown', outside)
    return () => { document.removeEventListener('pointerdown', outside); window.removeEventListener('scroll', place, true); window.removeEventListener('resize', place) }
  })
  const Items = (p: { items: readonly TableFilterItem[]; depth: number }) => <For each={p.items}>{item => <>
    <Show when={!query() || String(item.text).toLowerCase().includes(query().toLowerCase())}>
      <label class="flex items-center gap-2 py-1 text-[13px] font-normal cursor-pointer" style={{ 'padding-left': `${p.depth * 12}px` }}>
        <input type={props.column.filterMultiple === false ? 'radio' : 'checkbox'} checked={draft().includes(item.value)} onChange={e => {
          const checked = e.currentTarget.checked
          setDraft(previous => props.column.filterMultiple === false ? [item.value] : checked ? [...previous, item.value] : previous.filter(value => value !== item.value))
        }} />{String(item.text ?? item.value)}
      </label>
    </Show>
    <Show when={item.children}><Items items={item.children!} depth={p.depth + 1} /></Show>
  </>}</For>
  return <div ref={root} class="relative inline-flex" onKeyDown={e => { if (e.key === 'Escape' && open()) { e.stopPropagation(); close() } }}>
    <button ref={trigger} type="button" class={tableActionClass} aria-label={`筛选 ${typeof props.column.title === 'string' ? props.column.title : props.id}`} aria-expanded={open() ? 'true' : 'false'} aria-haspopup="dialog" disabled={props.disabled}
      style={{ color: active().length ? undefined : 'inherit' }} onClick={() => { setDraft([...active()]); setQuery(''); setOpen(!open()) }}>
      <span class={tableFilterIconClass} aria-hidden="true" /><Show when={active().length}><span class="text-[10px]">{active().length}</span></Show>
    </button>
    <Show when={open()}><Portal><div ref={panel} onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); close() } }} style={{ top: `${position().top}px`, left: `${position().left}px` }} role="dialog" aria-label={`筛选条件 ${props.id}`} class="fixed z-[1000] w-[220px] p-3 bg-surface rounded border border-solid border-outline-variant shadow-lg text-on-surface" >
      <input class={tableInputClass} aria-label="搜索筛选项" placeholder="搜索筛选项" value={query()} onInput={e => setQuery(e.currentTarget.value)} />
      <div class="max-h-[200px] overflow-auto my-2"><Items items={props.column.filters ?? []} depth={0} /></div>
      <div class="flex justify-between border-t border-solid border-outline-variant pt-2">
        <button type="button" class={tableActionClass} onClick={() => { props.table.resetColumnFilter(props.id); close() }}>重置</button>
        <button type="button" class={tableActionClass} onClick={() => { props.table.setColumnFilter(props.id, draft()); close() }}>确定</button>
      </div>
    </div></Portal></Show>
  </div>
}
