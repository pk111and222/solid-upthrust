// @unocss-include
import { cva } from 'class-variance-authority'

export const tagClass = cva(
  'inline-flex items-center gap-1 px-[7px] text-[12px] leading-[20px] rounded-sm border border-solid transition-colors align-middle',
  { variants: {
    tone: {
      default: 'bg-on-surface/4 text-on-surface border-outline-variant',
      success: 'bg-[#f6ffed] text-[#389e0d] border-[#b7eb8f]',
      processing: 'bg-primary/8 text-primary border-primary/30',
      error: 'bg-error/8 text-error border-error/30',
      warning: 'bg-[#fffbe6] text-[#ad6800] border-[#ffe58f]',
      custom: '',
    },
    bordered: { false: 'border-transparent', true: '' },
    disabled: { true: 'opacity-45 cursor-not-allowed', false: '' },
  }, defaultVariants: { tone: 'default', bordered: true, disabled: false } },
)

export const checkableTagClass = cva(
  'inline-flex items-center gap-1 px-[8px] text-[12px] leading-[22px] rounded-sm border-0 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-45 disabled:cursor-not-allowed',
  { variants: { checked: {
    true: 'bg-primary text-on-primary',
    false: 'bg-transparent text-on-surface hover:bg-on-surface/6',
  } } },
)

export const tagCloseClass = 'inline-flex items-center justify-center w-[16px] h-[16px] p-0 border-0 rounded-sm bg-transparent text-current opacity-60 hover:opacity-100 cursor-pointer focus-visible:outline-2 focus-visible:outline-current disabled:cursor-not-allowed'
