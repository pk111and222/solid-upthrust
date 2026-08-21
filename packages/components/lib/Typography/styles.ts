// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export const typographyVariants = cva(
  ["text-body", "text-on-surface"],
  {
    variants: {
      type: {
        secondary: ["text-on-surface-variant"],
        success: ["text-green-600"],
        warning: ["text-amber-500"],
        danger: ["text-error"],
      },
      disabled: {
        true: ["text-on-surface/25", "cursor-not-allowed", "select-none"],
        false: [],
      },
      ellipsis: {
        true: ["overflow-hidden", "text-ellipsis", "whitespace-nowrap"],
        false: [],
      },
    },
    defaultVariants: {
      disabled: false,
      ellipsis: false,
    },
  }
);

export const titleVariants = cva(
  ["font-semibold", "m-0", "mb-[0.5em]", "text-on-surface"],
  {
    variants: {
      level: {
        1: ["text-heading-1"],
        2: ["text-heading-2"],
        3: ["text-heading-3"],
        4: ["text-heading-4"],
        5: ["text-heading-5"],
      },
    },
    defaultVariants: { level: 1 },
  }
);

export const linkVariants = cva(
  [
    "text-primary", "cursor-pointer", "no-underline",
    "transition-upthrust-fast",
    "hover:text-primary/70",
  ],
  {
    variants: {
      disabled: {
        true: ["pointer-events-none", "text-on-surface/25", "cursor-not-allowed"],
        false: [],
      },
    },
    defaultVariants: { disabled: false },
  }
);

export const paragraphVariants = cva(
  ["mb-[1em]", "text-body"],
  { variants: {}, defaultVariants: {} }
);

export const typographyClass = (variants: VariantProps<typeof typographyVariants>) => twMerge(typographyVariants(variants));
export const titleClass = (variants: VariantProps<typeof titleVariants>) => twMerge(titleVariants(variants));
export const linkClass = (variants: VariantProps<typeof linkVariants>) => twMerge(linkVariants(variants));
export const paragraphClass = (variants: VariantProps<typeof paragraphVariants>) => twMerge(paragraphVariants(variants));
