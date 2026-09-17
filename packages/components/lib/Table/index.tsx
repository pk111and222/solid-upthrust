import { useComponentProps } from '../ConfigProvider/context'
import { createEffect, createMemo, createSignal, For, onCleanup, merge, omit, untrack, Show } from 'solid-js'
import { Dynamic, type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import { createTable, type TableCell, type TableRow, type TableKey, type TableBreakpoint } from 'upthrust-competence'
import Pagination from '../Pagination'
import { TableFilter } from './Filter'
import type { TableColumnType, TableProps, TableEditorContext } from './types'
import { tableRootClass, tableCellClass, tableActionClass, tableInputClass } from './styles'
export type { TableProps, TableColumnType, TableRef, TableEditorContext, TableExpandableProps, TablePaginationProps, TableRowSelectionProps } from './types'

const displayValue = (value: unknown): JSX.Element => value === null || value === undefined ? '—' : String(value)

const Check = (p: { label: string; checked: boolean; mixed?: boolean; disabled?: boolean; radio?: boolean; onChange: (checked: boolean, shift: boolean) => void }) => {
  let input!: HTMLInputElement
  let shift = false
  createEffect(() => !!p.mixed, value => { if (input) input.indeterminate = value })
  return <input ref={input} type={p.radio ? 'radio' : 'checkbox'} class="cursor-pointer accent-primary disabled:cursor-not-allowed" aria-label={p.label}
    aria-checked={p.mixed ? 'mixed' : p.checked ? 'true' : 'false'} checked={p.checked} disabled={p.disabled}
    onClick={e => { shift = e.shiftKey; e.stopPropagation() }} onChange={e => {
      const before = p.checked, mixed = !!p.mixed
      p.onChange(e.currentTarget.checked, shift)
      // A controlled parent may reject this proposal; reset the native toggle.
      e.currentTarget.checked = before; e.currentTarget.indeterminate = mixed
    }} />
}

const Table = <T,>(providedProps: TableProps<T>) => {
  const props = useComponentProps('Table', providedProps)
  let root!: HTMLDivElement, viewport!: HTMLDivElement
  const [headerHeight, setHeaderHeight] = createSignal(0)
  let head: HTMLTableSectionElement | undefined
  let tableElement!: HTMLTableElement
  const [measuredWidths, setMeasuredWidths] = createSignal<ReadonlyMap<string, number>>(new Map(), { ownedWrite: true })
  const [measuredSelection, setMeasuredSelection] = createSignal(0, { ownedWrite: true })
  const virtualEnabled = () => !!props.virtual
  const [breakpoints, setBreakpoints] = createSignal<Partial<Record<TableBreakpoint, boolean>> | undefined>(undefined, { ownedWrite: true })
  createEffect(() => true, () => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const queries: Record<TableBreakpoint, string> = { xs: '(max-width: 575px)', sm: '(min-width: 576px)', md: '(min-width: 768px)', lg: '(min-width: 992px)', xl: '(min-width: 1200px)', xxl: '(min-width: 1600px)' }
    const media = (Object.entries(queries) as [TableBreakpoint, string][]).map(([key, query]) => [key, window.matchMedia(query)] as const)
    const update = () => setBreakpoints(Object.fromEntries(media.map(([key, match]) => [key, match.matches])))
    media.forEach(([, match]) => match.addEventListener('change', update)); update()
    return () => media.forEach(([, match]) => match.removeEventListener('change', update))
  })
  const config = omit(props, 'virtual', 'expandable', 'breakpoints')
  const machine = createTable<T>(merge(config, {
    get breakpoints() { return props.breakpoints ?? breakpoints() },
    get virtual() { return props.virtual === true ? { estimateRowHeight: 48 } : props.virtual || undefined },
    get expandable() {
      const expandable = props.expandable
      return expandable?.expandedRowRender && !expandable.rowExpandable ? { ...expandable, rowExpandable: () => true } : expandable
    },
  }))
  const selectionWidth = () => props.rowSelection ? props.rowSelection.columnWidth ?? 48 : 0
  const selectionFixed = () => !!props.rowSelection?.fixed
  const editEnabled = () => !!props.editing
  const extraColumns = () => (props.rowSelection ? 1 : 0) + (editEnabled() ? 1 : 0)
  const columnCount = () => Math.max(1, machine.getVisibleColumns().length + extraColumns())
  const viewRows = createMemo(() => virtualEnabled() ? machine.virtual.virtualRows().map(item => item.row) : machine.getRowModel().rows)
  const pageData = () => machine.getRowModel().rows.flatMap(row => row.original === undefined ? [] : [row.original])
  const indices = createMemo(() => new Map(machine.getRowModel().rows.map((row, index) => [row.id, index])))
  const indexOf = (row: TableRow<T>) => indices().get(row.id) ?? 0
  const layoutMap = createMemo(() => {
    const entries = machine.getColumnLayout().map(item => ({ ...item, width: measuredWidths().get(item.column.id) ?? item.width }))
    let start = 0, end = entries.filter(item => item.region === 'end').reduce((sum, item) => sum + item.width, 0)
    return new Map(entries.map(item => {
      if (item.region === 'start') { item.offset = start; start += item.width }
      if (item.region === 'end') { end -= item.width; item.offset = end }
      return [item.column.id, item]
    }))
  })
  const measureColumns = () => {
    if (!tableElement) return
    const measured = new Map<string, number>()
    const cols = tableElement.querySelectorAll('col')
    const offset = props.rowSelection ? 1 : 0
    if (offset) setMeasuredSelection(cols[0]?.getBoundingClientRect().width ?? selectionWidth())
    machine.getVisibleColumns().forEach((column, index) => { const width = cols[index + offset]?.getBoundingClientRect().width; if (width) measured.set(column.id, width) })
    setMeasuredWidths(previous => measured.size === previous.size && [...measured].every(([id, width]) => previous.get(id) === width) ? previous : measured)
  }
  createEffect(() => machine.getColumnLayout(), () => {
    const frame = requestAnimationFrame(measureColumns)
    return () => cancelAnimationFrame(frame)
  })
  const cellStyle = (id: string, header = false): JSX.CSSProperties => {
    const layout = layoutMap().get(id)
    const fixed = layout?.region !== 'center' && layout?.offset !== undefined
    return { 'text-align': machine.getColumn(id)?.definition.align ?? 'left', position: fixed ? 'sticky' : undefined,
      left: layout?.region === 'start' ? `${layout.offset! + (selectionFixed() ? measuredSelection() || selectionWidth() : 0)}px` : undefined,
      right: layout?.region === 'end' ? `${layout.offset}px` : undefined,
      'z-index': fixed ? header ? 4 : 2 : undefined,
      'box-shadow': fixed && (layout?.region === 'start' ? layout.last : layout?.first) ? `${layout?.region === 'start' ? '3' : '-3'}px 0 5px -4px currentColor` : undefined,
    }
  }
  const cellClass = (header = false) => tableCellClass({ size: props.size ?? 'middle', bordered: props.bordered, header })
  const selectionStyle = (): JSX.CSSProperties => selectionFixed() ? { position: 'sticky', left: '0px', 'z-index': 3 } : {}
  const syncViewport = () => {
    if (!viewport) return
    machine.virtual.setViewport(Math.max(0, viewport.clientHeight - (props.showHeader === false ? 0 : headerHeight())))
    machine.virtual.setScrollTop(Math.max(0, viewport.scrollTop - (props.sticky ? 0 : headerHeight())))
  }
  const scrollTo = (target: { key?: TableKey; index?: number; top?: number; align?: 'start' | 'center' | 'end' | 'nearest' }) => {
    if (virtualEnabled()) {
      const top = machine.virtual.resolveScrollTo(target)
      if (top !== undefined) viewport.scrollTo({ top: top + (props.sticky ? 0 : headerHeight()) })
    } else if (target.top !== undefined) viewport.scrollTo({ top: target.top })
    else {
      const row = target.key !== undefined ? machine.getRowModel().rows.find(row => row.key === target.key) : machine.getRowModel().rows[target.index ?? 0]
      const element = row && [...viewport.querySelectorAll<HTMLTableRowElement>('tr[data-row-id]')].find(el => el.dataset.rowId === row.id)
      if (element) viewport.scrollTo({ top: element.offsetTop - (props.sticky ? headerHeight() : 0) })
    }
  }
  createEffect(() => true, () => untrack(() => {
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { setHeaderHeight(head?.getBoundingClientRect().height ?? 0); measureColumns(); syncViewport() }) : undefined
    observer?.observe(viewport); observer?.observe(tableElement); if (head) observer?.observe(head)
    setHeaderHeight(head?.getBoundingClientRect().height ?? 0); measureColumns(); syncViewport()
    props.ref?.({ nativeElement: root, table: machine, scrollTo })
    return () => observer?.disconnect()
  }))
  createEffect(() => ({ page: machine.getPagination().current, size: machine.getPagination().pageSize }), () => {
    if (viewport) { viewport.scrollTop = 0; machine.virtual.setScrollTop(0) }
  })
  let cleanupResize: (() => void) | undefined
  onCleanup(() => cleanupResize?.())
  const startResize = (id: string, e: PointerEvent) => {
    if (!machine.beginColumnResize(id, e.clientX)) return
    e.preventDefault(); e.stopPropagation(); cleanupResize?.()
    const move = (event: PointerEvent) => machine.updateColumnResize(event.clientX, getComputedStyle(root).direction === 'rtl' ? 'rtl' : 'ltr')
    const end = () => { machine.endColumnResize(); cleanupResize?.() }
    const cancel = () => { machine.endColumnResize(false); cleanupResize?.() }
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') cancel() }
    document.addEventListener('pointermove', move); document.addEventListener('pointerup', end); document.addEventListener('pointercancel', cancel); document.addEventListener('keydown', key)
    cleanupResize = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', end); document.removeEventListener('pointercancel', cancel); document.removeEventListener('keydown', key); cleanupResize = undefined }
  }
  let rangeAnchor: TableKey | undefined
  const selectRow = (row: TableRow<T>, checked: boolean, shift: boolean) => {
    if (shift && rangeAnchor !== undefined && props.rowSelection?.type !== 'radio') machine.selection.selectRange(rangeAnchor, row.key, checked)
    else machine.selection.toggleRow(row.key, checked)
    rangeAnchor = row.key
  }
  const Editor = (p: { cell: TableCell<T>; column: TableColumnType<T> }) => {
    const draft = () => machine.editing.getDraft(p.cell.row.key)!
    const value = () => p.cell.column.getValue(draft().record, p.cell.row.index)
    const editorContext: TableEditorContext<T> = {
      get value() { return value() }, get record() { return draft().record }, get column() { return p.column },
      get error() { return draft().errors[p.cell.column.id] }, get disabled() { return draft().status === 'saving' },
      onChange: next => machine.editing.setValue(p.cell.row.key, p.cell.column.id, next),
    }
    const context = () => editorContext
    return <div onClick={e => e.stopPropagation()}>
      <Show when={p.column.editor} fallback={<input class={tableInputClass} aria-label={`编辑 ${typeof p.column.title === 'string' ? p.column.title : p.cell.column.id}`} aria-invalid={context().error ? 'true' : 'false'}
        type={typeof value() === 'number' ? 'number' : 'text'} value={value() === undefined || value() === null ? '' : String(value())} disabled={context().disabled}
        onInput={e => context().onChange(typeof value() === 'number' ? e.currentTarget.valueAsNumber : e.currentTarget.value)}
        onKeyDown={e => { if (e.key === 'Escape') machine.editing.cancel(p.cell.row.key); if (e.key === 'Enter') void machine.editing.commit(p.cell.row.key) }} />}>
        {p.column.editor?.(editorContext)}
      </Show>
      <Show when={context().error}><span role="alert" class="block text-error text-[12px] mt-1">{context().error}</span></Show>
    </div>
  }
  const BodyRow = (p: { row: TableRow<T> }) => {
    let element!: HTMLTableRowElement, detail: HTMLTableRowElement | undefined
    const draft = () => machine.editing.getDraft(p.row.key)
    const selected = () => machine.selection.getCheckState(p.row.key)
    const cells = () => machine.getCellRows()[indexOf(p.row)] ?? []
    const rowProps = () => p.row.original === undefined ? {} : props.onRow?.(p.row.original, indexOf(p.row)) ?? {}
    const rowClass = () => p.row.original === undefined ? '' : typeof props.rowClassName === 'function' ? props.rowClassName(p.row.original, indexOf(p.row)) : props.rowClassName
    const detailOpen = () => p.row.original !== undefined && !!props.expandable?.expandedRowRender && (props.expandable.rowExpandable?.(p.row.original) ?? true) && machine.isExpanded(p.row.key)
    createEffect(() => ({ virtual: virtualEnabled(), detail: detailOpen() }), value => {
      if (!value.virtual || !element || typeof ResizeObserver === 'undefined') return
      const measure = () => untrack(() => machine.virtual.measureRow(p.row.key, element.getBoundingClientRect().height + (detail?.getBoundingClientRect().height ?? 0)))
      const observer = new ResizeObserver(measure); observer.observe(element); if (detail) observer.observe(detail); measure()
      return () => observer.disconnect()
    })
    const firstColumn = () => machine.getVisibleColumns()[0]?.id
    const background = () => selected() === 'checked' ? 'bg-primary-container' : props.striped && indexOf(p.row) % 2 ? 'bg-surface-container-low' : 'bg-surface'
    return <>
      <tr {...rowProps()} ref={element} data-row-id={p.row.id} aria-selected={props.rowSelection ? selected() === 'checked' ? 'true' : 'false' : undefined}
        class={twMerge('group', background(), rowClass(), typeof rowProps().class === 'string' ? rowProps().class as string : undefined)} onClick={e => { if (p.row.original !== undefined) props.onRowClick?.(p.row.original, e); const handler = rowProps().onClick; if (typeof handler === 'function') handler(e) }}>
        <Show when={props.rowSelection}><td class={twMerge(cellClass(), background(), 'text-center')} style={selectionStyle()}>
          <Show when={p.row.original !== undefined}><Check label={`选择行 ${String(p.row.key)}`} checked={selected() === 'checked'} mixed={selected() === 'mixed'} radio={props.rowSelection?.type === 'radio'} disabled={props.loading || machine.selection.isRowDisabled(p.row.key)} onChange={(checked, shift) => selectRow(p.row, checked, shift)} /></Show>
        </td></Show>
        <For each={cells()}>{cell => {
          const column = () => cell.column.definition as TableColumnType<T>
          const content = () => p.row.original === undefined ? displayValue(cell.value) : column().render ? column().render!(cell.value, p.row.original!, indexOf(p.row)) : displayValue(cell.value)
          return <Show when={!cell.hidden}><Dynamic component={column().rowScope ? 'th' : 'td'} scope={column().rowScope} {...cell.props as JSX.TdHTMLAttributes<HTMLTableCellElement>} rowspan={cell.rowSpan} colspan={cell.colSpan}
            class={twMerge(cellClass(), background(), 'group-hover:bg-surface-container-low', column().ellipsis ? 'truncate' : '', column().class)} style={{ ...(typeof cell.props.style === 'object' ? cell.props.style as JSX.CSSProperties : {}), ...cellStyle(cell.column.id) }}
            title={column().ellipsis && (typeof cell.value === 'string' || typeof cell.value === 'number') ? String(cell.value) : undefined}>
            <div class="flex items-center gap-1 min-w-0" style={{ 'padding-left': cell.column.id === firstColumn() ? `${p.row.depth * (props.expandable?.indentSize ?? 16)}px` : undefined }}>
              <Show when={cell.column.id === firstColumn() && machine.canExpand(p.row.key)}><button type="button" class={twMerge(tableActionClass, 'shrink-0 text-on-surface-variant')} aria-label={`${machine.isExpanded(p.row.key) ? '收起' : '展开'}行 ${String(p.row.key)}`} aria-expanded={machine.isExpanded(p.row.key) ? 'true' : 'false'} disabled={props.loading} onClick={e => { e.stopPropagation(); machine.toggleExpanded(p.row.key) }}>
                <span class={machine.isExpanded(p.row.key) ? 'i-mdi-chevron-down' : 'i-mdi-chevron-right'} aria-hidden="true" />
              </button></Show>
              <div class={column().ellipsis ? 'min-w-0 flex-1 truncate' : 'min-w-0 flex-1'}>
                <Show when={draft() && column().editable} fallback={content()}><Editor cell={cell} column={column()} /></Show>
              </div>
            </div>
          </Dynamic></Show>
        }}</For>
        <Show when={editEnabled()}><td class={twMerge(cellClass(), background())}>
          <Show when={p.row.original !== undefined}><Show when={draft()} fallback={<button class={tableActionClass} type="button" disabled={props.loading} onClick={e => { e.stopPropagation(); machine.editing.begin(p.row.key) }}>编辑</button>}>
            <div class="flex gap-1"><button class={tableActionClass} type="button" disabled={props.loading || draft()?.status === 'saving' || draft()?.status === 'validating'} onClick={e => { e.stopPropagation(); void machine.editing.commit(p.row.key) }}>{draft()?.status === 'saving' ? '保存中…' : '保存'}</button>
              <button class={tableActionClass} type="button" disabled={draft()?.status === 'saving'} onClick={e => { e.stopPropagation(); machine.editing.cancel(p.row.key) }}>取消</button></div>
            <Show when={draft()?.errors._row}><div role="alert" class="text-error text-[12px]">{draft()?.errors._row}</div></Show>
          </Show></Show>
        </td></Show>
      </tr>
      <Show when={detailOpen()}><tr ref={detail} class="bg-surface-container-low"><td class={cellClass()} colspan={columnCount()}>{props.expandable?.expandedRowRender?.(p.row.original!, indexOf(p.row))}</td></tr></Show>
    </>
  }
  return <div ref={root} id={props.id} class={twMerge(tableRootClass({ bordered: props.bordered }), props.class)} style={props.style} aria-busy={props.loading ? 'true' : 'false'}>
    <Show when={props.title}><div class="px-4 py-3 bg-surface">{props.title?.(pageData())}</div></Show>
    <div ref={viewport} class="relative overflow-auto bg-surface" style={{ 'max-height': props.scroll?.y ? `${props.scroll.y}px` : virtualEnabled() ? '400px' : undefined }} onScroll={syncViewport}>
      <table ref={tableElement} class="w-full border-separate border-spacing-0" aria-label={props['aria-label'] ?? '数据表格'} style={{ 'table-layout': 'fixed', 'min-width': typeof props.scroll?.x === 'number' ? `${props.scroll.x}px` : props.scroll?.x,
        width: props.scroll?.x ? `${Math.max(machine.getTotalWidth() + selectionWidth() + (editEnabled() ? 150 : 0), typeof props.scroll.x === 'number' ? props.scroll.x : 0)}px` : '100%' }}>
        <Show when={props.caption}><caption class="text-left text-on-surface-variant px-4 py-2">{props.caption}</caption></Show>
        <colgroup>
          <Show when={props.rowSelection}><col style={{ width: `${selectionWidth()}px` }} /></Show>
          <For each={machine.getColumnLayout()}>{item => <col style={{ width: `${item.width}px` }} />}</For>
          <Show when={editEnabled()}><col style={{ width: '150px' }} /></Show>
        </colgroup>
        <Show when={props.showHeader !== false}><thead ref={head} style={{ position: props.sticky ? 'sticky' : undefined, top: typeof props.sticky === 'object' ? `${props.sticky.offsetHeader ?? 0}px` : '0px', 'z-index': 5 }}>
          <For each={machine.getHeaderGroups()}>{(headers, level) => <tr>
            <Show when={level() === 0 && props.rowSelection}><th class={twMerge(cellClass(true), 'text-center')} style={selectionStyle()} rowspan={machine.getHeaderGroups().length} scope="col">
              {props.rowSelection?.columnTitle}
              <Show when={props.rowSelection?.type !== 'radio'}><Check label="全选当前页" checked={machine.selection.getSelectAllState().checked} mixed={machine.selection.getSelectAllState().indeterminate} disabled={props.loading || machine.selection.getSelectAllState().disabled} onChange={checked => machine.selection.selectAll(checked)} /></Show>
            </th></Show>
            <For each={headers}>{header => {
              const column = () => header.column.definition as TableColumnType<T>
              const sort = () => machine.getState().sorters.find(sort => sort.columnKey === header.column.id)?.order
              const leaf = () => !header.column.children.length
              const pinId = () => machine.getVisibleColumns()[header.columnIndex + (header.region === 'end' ? header.colSpan - 1 : 0)]?.id ?? header.column.id
              return <th class={twMerge(cellClass(true), 'relative')} style={cellStyle(pinId(), true)} colspan={header.colSpan} rowspan={header.rowSpan} scope={leaf() ? 'col' : 'colgroup'} aria-sort={column().sorter ? sort() === 'ascend' ? 'ascending' : sort() === 'descend' ? 'descending' : 'none' : undefined}>
                <div class="flex items-center justify-between gap-1 min-w-0">
                  <Show when={leaf() && column().sorter} fallback={<span>{column().title ?? header.column.id}</span>}>
                    <button type="button" class={twMerge(tableActionClass, 'text-inherit px-0 font-semibold min-w-0')} aria-label={`排序 ${typeof column().title === 'string' ? column().title : header.column.id}`} disabled={props.loading} onClick={e => machine.toggleSorting(header.column.id, e.shiftKey || undefined)}>
                      <span class="truncate">{column().title ?? header.column.id}</span><span class={sort() === 'ascend' ? 'i-mdi-arrow-up text-primary' : sort() === 'descend' ? 'i-mdi-arrow-down text-primary' : 'i-mdi-unfold-more-horizontal text-on-surface-variant'} aria-hidden="true" />
                    </button>
                  </Show>
                  <Show when={leaf() && column().filters?.length}><TableFilter column={column()} id={header.column.id} table={machine} disabled={props.loading} /></Show>
                </div>
                <Show when={leaf() && column().resizable === true}><div role="separator" aria-label={`调整列宽 ${header.column.id}`} aria-orientation="vertical" aria-valuenow={layoutMap().get(header.column.id)?.width} aria-valuemin={column().minWidth ?? 40} aria-valuemax={column().maxWidth ?? 10000} tabindex={props.loading ? -1 : 0}
                  class="absolute right-0 top-0 bottom-0 w-[5px] cursor-col-resize hover:bg-primary/30 focus:bg-primary/30 outline-none" onPointerDown={e => { if (!props.loading) startResize(header.column.id, e) }}
                  onKeyDown={e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); machine.setColumnWidth(header.column.id, (layoutMap().get(header.column.id)?.width ?? 150) + (e.key === 'ArrowRight' ? 10 : -10)) } }} /></Show>
              </th>
            }}</For>
            <Show when={level() === 0 && editEnabled()}><th class={cellClass(true)} rowspan={machine.getHeaderGroups().length} scope="col">操作</th></Show>
          </tr>}</For>
        </thead></Show>
        <tbody>
          <Show when={virtualEnabled() && machine.virtual.spacerPadding()[0] > 0}><tr aria-hidden="true"><td colspan={columnCount()} style={{ height: `${machine.virtual.spacerPadding()[0]}px`, padding: 0, border: 0 }} /></tr></Show>
          <For each={viewRows()} fallback={<Show when={!machine.getRowModel().rows.length}><tr><td colspan={columnCount()} class="text-center py-12 text-on-surface-variant">{props.emptyText ?? '暂无数据'}</td></tr></Show>}>{row => <BodyRow row={row} />}</For>
          <Show when={virtualEnabled() && machine.virtual.spacerPadding()[1] > 0}><tr aria-hidden="true"><td colspan={columnCount()} style={{ height: `${machine.virtual.spacerPadding()[1]}px`, padding: 0, border: 0 }} /></tr></Show>
        </tbody>
        <Show when={props.summary}><tfoot>{props.summary?.(pageData(), machine)}</tfoot></Show>
      </table>
    </div>
    <Show when={props.loading}><div role="status" aria-live="polite" class="absolute inset-0 z-20 bg-surface/70 flex items-center justify-center pointer-events-auto"><span class="flex items-center gap-2 px-4 py-2 bg-surface rounded shadow"><span class="i-mdi-loading animate-spin" aria-hidden="true" />加载中…</span></div></Show>
    <Show when={props.footer}><div class="px-4 py-3 bg-surface border-t border-solid border-outline-variant">{props.footer?.(pageData())}</div></Show>
    <Show when={props.pagination !== false}><div class="flex flex-wrap items-center justify-end gap-3 p-3 bg-surface">
      <Show when={machine.getPagination().total !== undefined} fallback={<><button type="button" class={tableActionClass} disabled={props.loading || !machine.canPreviousPage()} onClick={machine.previousPage}>上一页</button><span>第 {machine.getPagination().current} 页</span><button type="button" class={tableActionClass} disabled={props.loading || !machine.canNextPage()} onClick={machine.nextPage}>下一页</button></>}>
        <Pagination total={machine.getPagination().total ?? 0} current={machine.getPagination().current} pageSize={machine.getPagination().pageSize} disabled={props.loading} align="end" size={props.size === 'small' ? 'small' : 'default'}
          pageSizeOptions={props.pagination && props.pagination.pageSizeOptions || undefined} hideOnSinglePage={props.pagination && props.pagination.hideOnSinglePage || false} showQuickJumper={props.pagination && props.pagination.showQuickJumper || false}
          showTotal={props.pagination && props.pagination.showTotal || (total => `共 ${total} 条`)} onChange={(current, pageSize) => machine.setPagination({ current, pageSize })} />
      </Show>
    </div></Show>
  </div>
}
export default Table
