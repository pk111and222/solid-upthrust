// @unocss-include
import { cva } from 'class-variance-authority'
export const tableRootClass = cva('relative min-w-0 text-on-surface text-[14px]', {
  variants: { bordered: { true: 'border border-solid border-outline-variant rounded overflow-hidden', false: '' } },
})
export const tableCellClass = cva('box-border border-0 border-b border-solid border-outline-variant text-left align-middle transition-colors', {
  variants: {
    size: { small: 'px-3 py-2', middle: 'px-4 py-3', large: 'px-4 py-4' },
    bordered: { true: 'border-r', false: '' },
    header: { true: 'font-semibold bg-surface-container-low text-on-surface', false: '' },
  }, defaultVariants: { size: 'middle', bordered: false, header: false },
})
export const tableActionClass = 'inline-flex items-center justify-center gap-1 rounded-sm border-0 bg-transparent text-primary cursor-pointer px-2 py-1 text-[13px] hover:bg-primary/8 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40 disabled:cursor-not-allowed'
export const tableInputClass = 'box-border w-full min-w-0 rounded-sm border border-solid border-outline-variant px-2 py-1 bg-surface text-on-surface focus:outline-primary disabled:opacity-50'
export const tableFilterIconClass = 'i-mdi-filter-variant'
