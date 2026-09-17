// @unocss-include
import { cva } from 'class-variance-authority'
export const colorTriggerClass = cva('inline-flex items-center justify-center gap-2 border border-solid rounded bg-surface text-on-surface cursor-pointer focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-45 disabled:cursor-not-allowed transition-colors', {
  variants: {
    size: { small: 'min-h-[24px] p-1 text-[12px]', middle: 'min-h-[32px] p-[5px] text-[14px]', large: 'min-h-[40px] p-[7px] text-[16px]' },
    status: { default: 'border-outline-variant hover:border-primary', error: 'border-error', warning: 'border-warning' },
  }, defaultVariants: { size: 'middle', status: 'default' },
})
export const colorPanelClass = 'w-[280px] max-w-full box-border p-3 bg-surface rounded-lg text-on-surface text-[13px]'
export const colorInputClass = 'box-border w-full min-w-0 rounded-sm border border-solid border-outline-variant bg-surface text-on-surface px-2 py-1 focus:outline-primary disabled:opacity-45'
export const colorActionClass = 'border-0 bg-transparent rounded-sm px-2 py-1 text-primary cursor-pointer hover:bg-primary/8 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-45 disabled:cursor-not-allowed'
export const colorCheckIconClass = 'i-mdi-check'
export const colorClearIconClass = 'i-mdi-close'
export const checkerboard = { 'background-image': 'conic-gradient(#d4d4d4 25%, #fff 0 50%, #d4d4d4 0 75%, #fff 0)', 'background-size': '8px 8px' }
export const colorRangeClass = 'appearance-none flex-1 min-w-0 h-[10px] m-0 rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-solid [&::-webkit-slider-thumb]:border-gray-400 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:w-[12px] [&::-moz-range-thumb]:h-[12px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-gray-400 focus-visible:outline-2 focus-visible:outline-primary'
