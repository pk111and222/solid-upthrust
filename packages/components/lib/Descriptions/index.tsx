import { Component, For, Show, createMemo, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  descriptionsRootClass,
  descriptionsHeaderClass,
  descriptionsTitleClass,
  descriptionsExtraClass,
  descriptionsViewClass,
  descriptionsTableClass,
  descriptionsBorderedLabelClass,
  descriptionsBorderedContentClass,
  descriptionsItemCellClass,
  descriptionsLabelSpanClass,
  descriptionsContentSpanClass,
  descriptionsColonClass,
  descriptionsVerticalLabelClass,
  descriptionsVerticalContentClass,
  descriptionsVerticalRowBorderClass,
} from './styles'

export type DescriptionsSize = 'small' | 'middle' | 'large'
export type DescriptionsLayout = 'horizontal' | 'vertical'

export interface DescriptionsItem {
  /** Label of the field. */
  label?: JSX.Element
  /** Value of the field. */
  children?: JSX.Element
  /** Number of columns included. Default 1; 'filled' takes the rest of the row. */
  span?: number | 'filled'
  /** Per-item colon override (horizontal layout only). */
  colon?: boolean
  class?: string
  style?: JSX.CSSProperties
}

export interface DescriptionsSemanticSlots {
  root?: string
  header?: string
  title?: string
  extra?: string
  label?: string
  content?: string
}

export interface DescriptionsSemanticStyles {
  root?: JSX.CSSProperties
  header?: JSX.CSSProperties
  title?: JSX.CSSProperties
  extra?: JSX.CSSProperties
  label?: JSX.CSSProperties
  content?: JSX.CSSProperties
}

export interface DescriptionsProps {
  /** Field items. */
  items: DescriptionsItem[]
  /** Title rendered top-left; extra renders top-right. */
  title?: JSX.Element
  /** The action area of the description list, placed at the top-right. */
  extra?: JSX.Element
  /** Number of description items per row. Default 3. */
  column?: number | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl', number>>
  /** Border mode: renders a bordered grid. Default false. */
  bordered?: boolean
  /** Size of the list. Default 'middle'. */
  size?: DescriptionsSize
  /** Layout: horizontal (label beside content) or vertical (label row above content row). Default 'horizontal'. */
  layout?: DescriptionsLayout
  /** Show colon after labels (horizontal layout). Default true. */
  colon?: boolean
  /** Semantic class slots. */
  classNames?: DescriptionsSemanticSlots
  /** Semantic inline styles. */
  styles?: DescriptionsSemanticStyles
  class?: string
  style?: JSX.CSSProperties
}

type DescriptionsColumn =
  | number
  | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl', number>>

type ColumnKey = keyof Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl', number>>

/**
 * Breakpoint table shared with the Sider/Masonry column scale — widest-first.
 */
const BREAKPOINT_PX: Array<[ColumnKey, number]> = [
  ['xxl', 1600],
  ['xl', 1200],
  ['lg', 992],
  ['md', 768],
  ['sm', 576],
  ['xs', 0],
]

/** antd DEFAULT_COLUMN_MAP fallback when `column` is a partial map. */
const DEFAULT_COLUMN_MAP: Partial<Record<ColumnKey, number>> = {
  xxl: 3, xl: 3, lg: 3, md: 3, sm: 2, xs: 1,
}

/**
 * Responsive column resolution — antd matchScreen semantics:
 * widest active breakpoint wins; if none is active the DEFAULT_COLUMN_MAP
 * applies; only when that also misses does 3 (antd's final fallback) win.
 */
const resolveColumn = (column: DescriptionsColumn): number => {
  if (typeof column === 'number') return Math.max(1, column)
  const w = typeof window !== 'undefined' ? window.innerWidth : Infinity
  const userMatch = matchScreen(column, w)
  if (userMatch !== undefined) return Math.max(1, userMatch)
  const defaultMatch = matchScreen(DEFAULT_COLUMN_MAP, w)
  return Math.max(1, defaultMatch ?? 3)
}

const matchScreen = (map: Partial<Record<ColumnKey, number>>, w: number): number | undefined => {
  for (const [key, min] of BREAKPOINT_PX) {
    const v = map[key]
    if (v === undefined) continue
    if (w >= min) return v
  }
  return undefined
}

/** A packed cell: span counts BORDERED tracks (label + content pair). */
export interface DescriptionsRowCell {
  item: DescriptionsItem
  /** Rendered span of BOTH the th and td (antd: td colspan = span*2-1). */
  span: number
}

/**
 * Pack flat items into rows rc-descriptions (useRow/getCalcRows) style:
 * - span 'filled' takes the rest of the row and CLOSES it;
 * - a span exceeding the remaining space is clamped to it;
 * - a trailing partial row EXTENDS the last item's span instead of pushing
 *   placeholder cells (antd getLastChildColumn behavior — no empty <td>s).
 */
const toRows = (items: DescriptionsItem[], column: number): DescriptionsRowCell[][] => {
  const rows: DescriptionsRowCell[][] = []
  let row: DescriptionsRowCell[] = []
  let used = 0
  for (const item of items) {
    const span = item.span === 'filled' ? column - used : Math.max(1, item.span ?? 1)
    row.push({ item, span: Math.min(span, column - used) })
    used += Math.min(span, column - used)
    if (used >= column) {
      rows.push(row)
      row = []
      used = 0
    }
  }
  if (row.length) {
    // antd: the last item of an incomplete row absorbs the remaining columns.
    const last = row[row.length - 1]
    last.span = column - (used - last.span)
    rows.push(row)
  }
  return rows
}

const Descriptions: Component<DescriptionsProps> = (rawProps) => {
  const props = merge(
    {
      column: 3 as DescriptionsColumn,
      bordered: false,
      size: 'middle' as DescriptionsSize,
      layout: 'horizontal' as DescriptionsLayout,
      colon: true,
    } as Partial<DescriptionsProps>,
    rawProps,
  )

  const columnCount = createMemo(() => resolveColumn(props.column ?? 3))
  const rows = createMemo(() => toRows(props.items, columnCount()))
  const showColon = (item: DescriptionsItem) => item.colon ?? props.colon

  const hasHeader = createMemo(() => props.title !== undefined || props.extra !== undefined)

  // ---- horizontal, bordered: one <tr> per row, th/td pairs ------------------
  // antd Row.js: the label <th> is ALWAYS one column wide; the content <td>
  // takes span*2-1 so each item occupies exactly `span` label+content pairs
  // and vertical grid lines line up across rows.
  // antd cell borders: rows get border-b (dropped on the LAST row) and cells
  // get border-e (dropped on the last cell of a row) — the frame around the
  // whole grid lives on the view wrapper instead.
  const renderBorderedHorizontal = () => (
    <For each={rows()}>
      {(row, rowIndex) => (
        <tr>
          <For each={row}>
            {({ item, span }, cellIndex) => {
              const isLastRow = rowIndex() === rows().length - 1
              const isLastCell = cellIndex() === row.length - 1
              return (
                <>
                  <th
                    class={twMerge(
                      descriptionsBorderedLabelClass({ size: props.size, lastRow: isLastRow, lastCell: isLastCell }),
                      props.classNames?.label,
                    )}
                    style={props.styles?.label}
                    colspan={1}
                  >
                    {item.label}
                  </th>
                  <td
                    class={twMerge(
                      descriptionsBorderedContentClass({ size: props.size, lastRow: isLastRow, lastCell: isLastCell }),
                      props.classNames?.content,
                      item.class,
                    )}
                    style={{ ...props.styles?.content, ...item.style }}
                    colspan={span * 2 - 1}
                  >
                    {item.children}
                  </td>
                </>
              )
            }}
          </For>
        </tr>
      )}
    </For>
  )

  // ---- horizontal, default: one <td> per item, label+content inline ---------
  // antd itemPaddingEnd: only the LAST cell in a row drops the right gap —
  // approximated with content pr-[16px] (last td's trailing gap is invisible).
  const renderDefaultHorizontal = () => (
    <For each={rows()}>
      {(row) => (
        <tr>
          <For each={row}>
            {({ item, span }) => (
              <td
                class={twMerge(descriptionsItemCellClass({ size: props.size }), item.class)}
                style={item.style}
                colspan={span}
              >
                <Show when={item.label !== undefined}>
                  <span class={descriptionsLabelSpanClass({})} style={props.styles?.label}>
                    {item.label}
                    <Show when={showColon(item)}>
                      <span class={descriptionsColonClass({})}>:</span>
                    </Show>
                  </span>
                </Show>
                <span class={descriptionsContentSpanClass({})} style={props.styles?.content}>
                  {item.children}
                </span>
              </td>
            )}
          </For>
        </tr>
      )}
    </For>
  )

  // ---- vertical: label row above content row --------------------------------
  // antd vertical renders each packed row as a full <tr> of label <th> then a
  // full <tr> of content <td>. Bordered mode draws hairlines via the row-level
  // border-b / cell-level border-e (trailing row and trailing cell drop them,
  // matching the horizontal grid's rules); default stacks them borderless.
  // Column widths: tableLayout:auto gives leftover width to whichever column has
  // the widest content, which visibly skews multi-column rows (verified against
  // the antd DOM — same auto skew). The label <th> carries an explicit
  // `width: (100/column)%` so each column splits the table evenly; the content
  // <td> below keeps the same colspan and inherits the same track.
  const renderVertical = () => (
    <For each={rows()}>
      {(row, rowIndex) => {
        const isLastRow = rowIndex() === rows().length - 1
        return (
          <>
            <tr class={props.bordered && !isLastRow ? descriptionsVerticalRowBorderClass({}) : undefined}>
              <For each={row}>
                {({ item, span }, cellIndex) => (
                  <th
                    class={twMerge(
                      descriptionsVerticalLabelClass({ bordered: props.bordered, size: props.size, lastCell: cellIndex() === row.length - 1 }),
                      props.classNames?.label,
                    )}
                    style={{ ...props.styles?.label, width: `${(100 * span) / columnCount()}%` }}
                    colspan={span}
                  >
                    {item.label}
                  </th>
                )}
              </For>
            </tr>
            <tr class={props.bordered && !isLastRow ? descriptionsVerticalRowBorderClass({}) : undefined}>
              <For each={row}>
                {({ item, span }, cellIndex) => (
                  <td
                    class={twMerge(
                      descriptionsVerticalContentClass({ bordered: props.bordered, size: props.size, lastCell: cellIndex() === row.length - 1 }),
                      props.classNames?.content,
                      item.class,
                    )}
                    style={{ ...props.styles?.content, ...item.style }}
                    colspan={span}
                  >
                    {item.children}
                  </td>
                )}
              </For>
            </tr>
          </>
        )
      }}
    </For>
  )

  const renderBody = () => {
    if (props.layout === 'vertical') return renderVertical()
    if (props.bordered) return renderBorderedHorizontal()
    return renderDefaultHorizontal()
  }

  return (
    <div
      class={twMerge(descriptionsRootClass({}), props.class, props.classNames?.root)}
      style={{ ...props.style, ...props.styles?.root }}
    >
      <Show when={hasHeader()}>
        <div
          class={twMerge(descriptionsHeaderClass({}), props.classNames?.header)}
          style={props.styles?.header}
        >
          <div class={twMerge(descriptionsTitleClass({}), props.classNames?.title)} style={props.styles?.title}>
            {props.title}
          </div>
          <div class={twMerge(descriptionsExtraClass({}), props.classNames?.extra)} style={props.styles?.extra}>
            {props.extra}
          </div>
        </div>
      </Show>
      <div class={descriptionsViewClass({ bordered: props.bordered })}>
        <table class={descriptionsTableClass({ bordered: props.bordered })}>
          <tbody>{renderBody()}</tbody>
        </table>
      </div>
    </div>
  )
}

export default Descriptions
