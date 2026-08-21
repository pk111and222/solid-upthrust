// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const qrCodeVariants = cva(
  ["relative", "inline-block", "bg-white", "p-[12px]", "rounded-lg"],
  {
    variants: {
      bordered: {
        true: ["border", "border-solid", "border-outline-variant", "shadow"],
        false: [],
      },
    },
    defaultVariants: { bordered: true },
  }
);

// overlaid status mask (expired / loading / scanned)
const qrMaskVariants = cva(
  ["absolute", "inset-0", "flex", "flex-col", "items-center", "justify-center", "gap-[8px]", "bg-surface/95", "rounded-lg", "z-1"],
  { variants: {}, defaultVariants: {} }
);

const qrMaskTextVariants = cva(
  ["text-on-surface-variant", "text-[14px]"],
  { variants: {}, defaultVariants: {} }
)

const qrExpiredIconVariants = cva(
  ["text-on-surface-variant", "text-[48px]", "i-mdi-clock-alert-outline"],
  { variants: {}, defaultVariants: {} }
)

const qrScannedIconVariants = cva(
  ["text-primary", "text-[48px]", "i-mdi-check-circle-outline"],
  { variants: {}, defaultVariants: {} }
)

const qrLoadingIconVariants = cva(
  ["text-on-surface-variant", "text-[48px]", "i-mdi-loading", "animate-spin"],
  { variants: {}, defaultVariants: {} }
)

// refresh link in the expired mask
const qrRefreshVariants = cva(
  ["text-primary", "text-[14px]", "cursor-pointer", "hover:text-primary/70", "transition-upthrust-fast"],
  { variants: {}, defaultVariants: {} }
)

export const qrCodeClass = (variants: VariantProps<typeof qrCodeVariants>) => twMerge(qrCodeVariants(variants));
export const qrMaskClass = (variants: VariantProps<typeof qrMaskVariants>) => twMerge(qrMaskVariants(variants));
export const qrMaskTextClass = (variants: VariantProps<typeof qrMaskTextVariants>) => twMerge(qrMaskTextVariants(variants));
export const qrExpiredIconClass = (variants: VariantProps<typeof qrExpiredIconVariants>) => twMerge(qrExpiredIconVariants(variants));
export const qrScannedIconClass = (variants: VariantProps<typeof qrScannedIconVariants>) => twMerge(qrScannedIconVariants(variants));
export const qrLoadingIconClass = (variants: VariantProps<typeof qrLoadingIconVariants>) => twMerge(qrLoadingIconVariants(variants));
export const qrRefreshClass = (variants: VariantProps<typeof qrRefreshVariants>) => twMerge(qrRefreshVariants(variants));
