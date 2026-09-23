// @unocss-include
import { cva } from 'class-variance-authority'

export const transferPanelClass = cva('flex flex-col w-[220px] shrink-0 h-[300px] border border-solid rounded bg-surface text-on-surface', {
  variants: { status: { default: 'border-outline-variant', error: 'border-error', warning: 'border-[#faad14]' } },
  defaultVariants: { status: 'default' },
})
export const transferRowClass = cva('flex items-center gap-2 min-h-[32px] px-3 py-1 text-[14px] transition-colors', {
  variants: { selected: { true: 'bg-primary/8', false: 'hover:bg-on-surface/4' }, disabled: { true: 'opacity-45 cursor-not-allowed', false: '' } },
})
export const transferActionClass = 'inline-flex items-center justify-center gap-1 min-w-[32px] min-h-[28px] px-2 border border-solid border-primary rounded-sm bg-primary text-on-primary cursor-pointer hover:opacity-85 disabled:bg-on-surface/4 disabled:border-outline-variant disabled:text-on-surface/25 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2'
export const transferCheckboxClass = 'shrink-0 w-[14px] h-[14px] accent-primary cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary'
