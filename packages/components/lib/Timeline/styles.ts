// @unocss-include
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const timelineVariants = cva(
  ['w-full'],
  {
    variants: {
      orientation: {
        vertical: ['flex', 'flex-col'],
        horizontal: ['flex', 'items-stretch', 'overflow-x-auto'],
      },
    },
    defaultVariants: { orientation: 'vertical' },
  },
)

const timelineItemVariants = cva(
  ['relative', 'min-w-0'],
  {
    variants: {
      layout: {
        'vertical-plain-start': ['grid', 'grid-cols-[24px_minmax(0,1fr)]'],
        'vertical-plain-end': ['grid', 'grid-cols-[minmax(0,1fr)_24px]'],
        'vertical-titled': ['grid', 'grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)]'],
        'vertical-alternate': ['grid', 'grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)]'],
        horizontal: ['grid', 'flex-1', 'min-w-[160px]', 'grid-rows-[minmax(0,1fr)_24px_minmax(0,1fr)]'],
      },
    },
    defaultVariants: { layout: 'vertical-plain-start' },
  },
)

const timelineDotColumnVariants = cva(
  ['relative', 'z-1', 'flex', 'justify-center'],
  {
    variants: {
      position: {
        'vertical-start': ['col-start-1'],
        'vertical-center': ['col-start-2'],
        'vertical-end': ['col-start-2'],
        horizontal: ['row-start-2', 'items-center'],
      },
    },
    defaultVariants: { position: 'vertical-start' },
  },
)

const timelineRailVariants = cva(
  ['absolute', 'border-outline-variant', 'pointer-events-none'],
  {
    variants: {
      orientation: {
        vertical: ['top-[11px]', 'bottom-[-20px]', 'left-1/2', '-translate-x-1/2', 'border-l-2'],
        horizontal: ['top-1/2', 'left-1/2', 'right-[-50%]', '-translate-y-1/2', 'border-t-2'],
      },
      last: {
        true: ['hidden'],
        false: [],
      },
    },
    defaultVariants: { orientation: 'vertical', last: false },
  },
)

const timelineDotVariants = cva(
  ['relative', 'z-1', 'box-border', 'shrink-0', 'rounded-full', 'border-2', 'border-solid', 'transition-upthrust'],
  {
    variants: {
      colorScheme: {
        'outlined-blue': ['w-[8px]', 'h-[8px]', 'mt-[7px]', 'border-primary', 'bg-surface'],
        'outlined-red': ['w-[8px]', 'h-[8px]', 'mt-[7px]', 'border-error', 'bg-surface'],
        'outlined-green': ['w-[8px]', 'h-[8px]', 'mt-[7px]', 'border-[#52c41a]', 'bg-surface'],
        'outlined-gray': ['w-[8px]', 'h-[8px]', 'mt-[7px]', 'border-on-surface/25', 'bg-surface'],
        'filled-blue': ['w-[8px]', 'h-[8px]', 'mt-[7px]', 'border-primary', 'bg-primary'],
        'filled-red': ['w-[8px]', 'h-[8px]', 'mt-[7px]', 'border-error', 'bg-error'],
        'filled-green': ['w-[8px]', 'h-[8px]', 'mt-[7px]', 'border-[#52c41a]', 'bg-[#52c41a]'],
        'filled-gray': ['w-[8px]', 'h-[8px]', 'mt-[7px]', 'border-on-surface/25', 'bg-on-surface/25'],
      },
      orientation: {
        vertical: [],
        horizontal: ['mt-0'],
      },
    },
    defaultVariants: { colorScheme: 'outlined-blue', orientation: 'vertical' },
  },
)

const timelineCustomIconVariants = cva(
  ['relative', 'z-1', 'mt-[2px]', 'flex', 'min-h-[20px]', 'min-w-[20px]', 'items-center', 'justify-center', 'bg-surface', 'leading-none'],
  {
    variants: {
      color: {
        blue: ['text-primary'],
        red: ['text-error'],
        green: ['text-[#52c41a]'],
        gray: ['text-on-surface/25'],
      },
      orientation: {
        vertical: [],
        horizontal: ['mt-0'],
      },
    },
    defaultVariants: { color: 'blue', orientation: 'vertical' },
  },
)

const timelineLoadingIconVariants = cva(
  ['i-mdi-loading', 'inline-block', 'animate-spin', 'text-[20px]'],
  { variants: {}, defaultVariants: {} },
)

const timelineTitleVariants = cva(
  ['min-w-0', 'text-[14px]', 'leading-[22px]', 'text-on-surface-variant'],
  {
    variants: {
      position: {
        'vertical-left': ['col-start-1', 'text-right', 'pr-[20px]'],
        'vertical-right': ['col-start-3', 'text-left', 'pl-[20px]'],
        'horizontal-top': ['row-start-1', 'self-end', 'pb-[8px]', 'text-center'],
        'horizontal-bottom': ['row-start-3', 'self-start', 'pt-[8px]', 'text-center'],
      },
    },
    defaultVariants: { position: 'vertical-left' },
  },
)

const timelineContentVariants = cva(
  ['min-w-0', 'pb-[20px]', 'text-[14px]', 'leading-[22px]', 'text-on-surface'],
  {
    variants: {
      position: {
        'vertical-left': ['col-start-1', 'text-right', 'pr-[20px]', 'min-h-[40px]'],
        'vertical-right': ['col-start-3', 'text-left', 'pl-[20px]', 'min-h-[40px]'],
        'vertical-plain-start': ['col-start-2', 'pl-[12px]', 'min-h-[40px]'],
        'vertical-plain-end': ['col-start-1', 'text-right', 'pr-[12px]', 'min-h-[40px]'],
        'horizontal-top': ['row-start-1', 'self-end', 'pb-[8px]', 'text-center'],
        'horizontal-bottom': ['row-start-3', 'self-start', 'pt-[8px]', 'pb-0', 'text-center'],
      },
    },
    defaultVariants: { position: 'vertical-plain-start' },
  },
)

export const timelineClass = (variants: VariantProps<typeof timelineVariants>) => twMerge(timelineVariants(variants))
export const timelineItemClass = (variants: VariantProps<typeof timelineItemVariants>) => twMerge(timelineItemVariants(variants))
export const timelineDotColumnClass = (variants: VariantProps<typeof timelineDotColumnVariants>) => twMerge(timelineDotColumnVariants(variants))
export const timelineRailClass = (variants: VariantProps<typeof timelineRailVariants>) => twMerge(timelineRailVariants(variants))
export const timelineDotClass = (variants: VariantProps<typeof timelineDotVariants>) => twMerge(timelineDotVariants(variants))
export const timelineCustomIconClass = (variants: VariantProps<typeof timelineCustomIconVariants>) => twMerge(timelineCustomIconVariants(variants))
export const timelineLoadingIconClass = (variants: VariantProps<typeof timelineLoadingIconVariants>) => twMerge(timelineLoadingIconVariants(variants))
export const timelineTitleClass = (variants: VariantProps<typeof timelineTitleVariants>) => twMerge(timelineTitleVariants(variants))
export const timelineContentClass = (variants: VariantProps<typeof timelineContentVariants>) => twMerge(timelineContentVariants(variants))
