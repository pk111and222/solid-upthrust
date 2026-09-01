// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// ---- line variant ----------------------------------------------------------

const progressTrackVariants = cva(
  ["relative", "w-full", "bg-outline-variant/20", "rounded-full", "overflow-hidden", "transition-upthrust-fast"],
  {
    variants: {
      size: {
        small: ["h-[6px]"],
        middle: ["h-[8px]"],
        large: ["h-[12px]"],
      },
      shape: {
        round: [],
        square: ["!rounded-none"],
      },
    },
    defaultVariants: { size: "middle", shape: "round" },
  }
)

const progressIndicatorVariants = cva(
  ["h-full", "rounded-full", "transition-[width]", "duration-mid", "ease-upthrust"],
  {
    variants: {
      status: {
        normal: ["bg-primary"],
        active: ["bg-primary"],
        success: ["bg-[#52c41a]"],
        exception: ["bg-error"],
      },
      shape: {
        round: [],
        square: ["!rounded-none"],
      },
    },
    defaultVariants: { status: "normal", shape: "round" },
  }
)

// Success segment layered on top of the normal indicator (antd two-tone).
const progressSuccessVariants = cva(
  ["h-full", "bg-[#52c41a]", "rounded-full", "absolute", "top-0", "left-0"],
  { variants: {}, defaultVariants: {} }
)

// ---- text ------------------------------------------------------------------

const progressTextVariants = cva(
  ["text-[14px]", "text-on-surface", "whitespace-nowrap", "leading-[1]"],
  {
    variants: {
      size: {
        small: ["text-[12px]"],
        middle: [],
        large: ["text-[16px]"],
      },
    },
    defaultVariants: { size: "middle" },
  }
)

// ---- steps -----------------------------------------------------------------

const progressStepVariants = cva(
  ["flex", "items-center", "gap-[8px]"],
  { variants: {}, defaultVariants: {} }
)

const progressStepItemVariants = cva(
  ["flex-1", "bg-outline-variant/20", "transition-upthrust-fast", "rounded-[2px]"],
  {
    variants: {
      size: {
        small: ["h-[6px]"],
        middle: ["h-[8px]"],
        large: ["h-[12px]"],
      },
      filled: {
        true: [],
        false: [],
      },
      status: {
        normal: [],
        success: [],
        exception: [],
      },
    },
    // Filled×status merged colors (UnoCSS-safe: literals in variant values).
    defaultVariants: { size: "middle", filled: false, status: "normal" },
  }
)

// Step fill colors per status — kept as a plain lookup (not compoundVariants)
// because UnoCSS must see each class literal.
export const progressStepFillClass = (status: 'normal' | 'success' | 'exception'): string => {
  if (status === 'success') return 'bg-[#52c41a]'
  if (status === 'exception') return 'bg-error'
  return 'bg-primary'
}

// ---- circle ----------------------------------------------------------------

const progressCircleVariants = cva(
  ["relative", "inline-flex", "items-center", "justify-center"],
  { variants: {}, defaultVariants: {} }
)

const progressCircleTextVariants = cva(
  ["absolute", "inset-0", "flex", "flex-col", "items-center", "justify-center", "text-on-surface"],
  {
    variants: {
      size: {
        small: ["text-[14px]"],
        middle: ["text-[20px]"],
        large: ["text-[24px]"],
      },
    },
    defaultVariants: { size: "middle" },
  }
)

export const progressTrackClass = (variants: VariantProps<typeof progressTrackVariants>) =>
  twMerge(progressTrackVariants(variants))
export const progressIndicatorClass = (variants: VariantProps<typeof progressIndicatorVariants>) =>
  twMerge(progressIndicatorVariants(variants))
export const progressSuccessClass = (variants: VariantProps<typeof progressSuccessVariants>) =>
  twMerge(progressSuccessVariants(variants))
export const progressTextClass = (variants: VariantProps<typeof progressTextVariants>) =>
  twMerge(progressTextVariants(variants))
export const progressStepClass = (variants: VariantProps<typeof progressStepVariants>) =>
  twMerge(progressStepVariants(variants))
export const progressStepItemClass = (variants: VariantProps<typeof progressStepItemVariants>) =>
  twMerge(progressStepItemVariants(variants))
export const progressCircleClass = (variants: VariantProps<typeof progressCircleVariants>) =>
  twMerge(progressCircleVariants(variants))
export const progressCircleTextClass = (variants: VariantProps<typeof progressCircleTextVariants>) =>
  twMerge(progressCircleTextVariants(variants))
