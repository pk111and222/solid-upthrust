// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const statisticVariants = cva(
  ["flex", "flex-col", "min-w-0"],
  { variants: {}, defaultVariants: {} }
);

const statisticTitleVariants = cva(
  ["text-on-surface-variant", "text-[14px]", "leading-[1.5714]", "mb-[4px]"],
  { variants: {}, defaultVariants: {} }
);

const statisticValueVariants = cva(
  ["flex", "items-baseline", "gap-[4px]", "text-on-surface", "font-medium", "transition-upthrust-fast"],
  {
    variants: {
      loading: {
        true: ["opacity-0"],
        false: ["opacity-100"],
      },
    },
    defaultVariants: { loading: false },
  }
);

const statisticValueIntVariants = cva(
  ["text-[24px]", "leading-[1.33]", "tabular-nums"],
  { variants: {}, defaultVariants: {} }
);

const statisticPrefixSuffixVariants = cva(
  ["text-[24px]", "leading-[1.33]"],
  { variants: {}, defaultVariants: {} }
);

const statisticLoadingVariants = cva(
  ["inline-block", "h-[32px]", "w-[120px]", "animate-pulse", "rounded", "bg-surface-variant"],
  { variants: {}, defaultVariants: {} }
);

export const statisticClass = (variants: VariantProps<typeof statisticVariants>) => twMerge(statisticVariants(variants));
export const statisticTitleClass = (variants: VariantProps<typeof statisticTitleVariants>) => twMerge(statisticTitleVariants(variants));
export const statisticValueClass = (variants: VariantProps<typeof statisticValueVariants>) => twMerge(statisticValueVariants(variants));
export const statisticValueIntClass = (variants: VariantProps<typeof statisticValueIntVariants>) => twMerge(statisticValueIntVariants(variants));
export const statisticPrefixSuffixClass = (variants: VariantProps<typeof statisticPrefixSuffixVariants>) => twMerge(statisticPrefixSuffixVariants(variants));
export const statisticLoadingClass = (variants: VariantProps<typeof statisticLoadingVariants>) => twMerge(statisticLoadingVariants(variants));
