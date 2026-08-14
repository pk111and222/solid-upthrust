// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export const typographyVariants = cva(
  [
    "text-on-surface"
  ],
  {
    variants: {
      type: {
        secondary: ["text-on-surface-variant", "opacity-65"],
        success: ["text-green-600"],
        warning: ["text-amber-600"],
        danger: ["text-error"],
      },
      disabled: {
        true: ["opacity-40", "cursor-not-allowed", "select-none"],
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
  [
    "font-semibold", "leading-tight", "m-0", "mb-2"
  ],
  {
    variants: {
      level: {
        1: ["text-4xl"],
        2: ["text-3xl"],
        3: ["text-2xl"],
        4: ["text-xl"],
        5: ["text-lg"],
      },
    },
    defaultVariants: {
      level: 1,
    },
  }
);

export const linkVariants = cva(
  [
    "text-primary", "cursor-pointer", "no-underline",
    "hover:text-primary-container",
    "transition", "duration-100",
  ],
  {
    variants: {
      disabled: {
        true: ["pointer-events-none", "opacity-40", "cursor-not-allowed"],
        false: [],
      },
    },
    defaultVariants: {
      disabled: false,
    },
  }
);

export const paragraphVariants = cva(
  [
    "mb-4", "leading-relaxed"
  ],
  {
    variants: {},
    defaultVariants: {},
  }
);

export const typographyClass = (variants: VariantProps<typeof typographyVariants>) => twMerge(typographyVariants(variants));
export const titleClass = (variants: VariantProps<typeof titleVariants>) => twMerge(titleVariants(variants));
export const linkClass = (variants: VariantProps<typeof linkVariants>) => twMerge(linkVariants(variants));
export const paragraphClass = (variants: VariantProps<typeof paragraphVariants>) => twMerge(paragraphVariants(variants));
