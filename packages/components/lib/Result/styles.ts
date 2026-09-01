// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Result container: centered column like Empty, with generous padding.
const resultContainerVariants = cva(
  ["flex", "flex-col", "items-center", "justify-center", "text-center", "w-full", "py-[48px]"],
  { variants: {}, defaultVariants: {} }
)

// Icon circle: tinted container + status-colored icon.
const resultIconVariants = cva(
  ["w-[72px]", "h-[72px]", "rounded-full", "flex", "items-center", "justify-center", "text-[40px]"],
  {
    variants: {
      status: {
        // /10 opacity tints instead of antd's light hex backgrounds:
        // error/info already used this pattern, and it degrades correctly
        // in dark themes (light hex bg + light text = unreadable).
        // MD3 has no success/warning tokens, so the hex literals stay —
        // see common/colors.ts for the shared values and the preset TODO.
        success: ["bg-[#52c41a]/10", "text-[#52c41a]"],
        error: ["bg-error/10", "text-error"],
        warning: ["bg-[#faad14]/10", "text-[#faad14]"],
        info: ["bg-primary/10", "text-primary"],
        '404': ["bg-primary/10", "text-primary"],
        '403': ["bg-primary/10", "text-primary"],
        '500': ["bg-primary/10", "text-primary"],
      },
    },
    defaultVariants: { status: "info" },
  }
)

const resultTitleVariants = cva(
  ["text-[24px]", "font-medium", "text-on-surface", "mt-[24px]", "leading-[1.4]"],
  { variants: {}, defaultVariants: {} }
)

const resultSubtitleVariants = cva(
  ["text-[14px]", "text-on-surface-variant", "mt-[8px]", "leading-[1.5714]"],
  { variants: {}, defaultVariants: {} }
)

const resultExtraVariants = cva(
  ["mt-[24px]", "flex", "items-center", "justify-center", "gap-[8px]"],
  { variants: {}, defaultVariants: {} }
)

// Built-in status pages render a big wordmark instead of an icon circle.
const resultImageVariants = cva(
  ["text-[72px]", "font-bold", "leading-none", "select-none"],
  {
    variants: {
      status: {
        '404': ["text-primary"],
        '403': ["text-primary"],
        '500': ["text-primary"],
        // non-page statuses don't use the wordmark
        success: [],
        error: [],
        warning: [],
        info: [],
      },
    },
    defaultVariants: { status: "info" },
  }
)

export const resultContainerClass = (variants: VariantProps<typeof resultContainerVariants>) =>
  twMerge(resultContainerVariants(variants))
export const resultIconClass = (variants: VariantProps<typeof resultIconVariants>) =>
  twMerge(resultIconVariants(variants))
export const resultTitleClass = (variants: VariantProps<typeof resultTitleVariants>) =>
  twMerge(resultTitleVariants(variants))
export const resultSubtitleClass = (variants: VariantProps<typeof resultSubtitleVariants>) =>
  twMerge(resultSubtitleVariants(variants))
export const resultExtraClass = (variants: VariantProps<typeof resultExtraVariants>) =>
  twMerge(resultExtraVariants(variants))
export const resultImageClass = (variants: VariantProps<typeof resultImageVariants>) =>
  twMerge(resultImageVariants(variants))
