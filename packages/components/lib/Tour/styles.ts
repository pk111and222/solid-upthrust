// @unocss-include
import { cva } from 'class-variance-authority'
export const tourPanelClass = cva('fixed box-border rounded-lg shadow-xl border border-solid outline-none overflow-auto max-h-[calc(100vh-32px)]', {
  variants: { type: { default: 'bg-surface text-on-surface border-outline-variant', primary: 'bg-primary text-on-primary border-primary' } }, defaultVariants: { type: 'default' },
})
export const tourButtonClass = 'rounded px-3 py-1.5 text-[13px] border border-solid border-current bg-transparent text-inherit cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-current'
export const tourCloseClass = 'absolute right-3 top-3 w-7 h-7 flex items-center justify-center border-0 rounded bg-transparent text-inherit opacity-70 hover:opacity-100 cursor-pointer p-1 focus-visible:outline-2 focus-visible:outline-current'
export const tourCloseIcon = 'i-mdi-close inline-block w-4 h-4'
