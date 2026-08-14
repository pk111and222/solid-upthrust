// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const layoutVariants = cva(
  ["flex", "flex-auto"],
  {
    variants: {
      direction: {
        horizontal: ["flex-row"],
        vertical: ["flex-col"],
      },
    },
    defaultVariants: {
      direction: "vertical",
    },
  }
);

const headerVariants = cva(
  ["flex-none", "h-16", "px-6", "leading-[64px]", "bg-surface-variant/30"],
  { variants: {}, defaultVariants: {} }
);

const footerVariants = cva(
  ["flex-none", "px-6", "py-6", "bg-surface-variant/30"],
  { variants: {}, defaultVariants: {} }
);

const contentVariants = cva(
  ["flex-auto", "min-h-0"],
  { variants: {}, defaultVariants: {} }
);

const siderVariants = cva(
  ["relative", "flex-none", "transition-all", "duration-200"],
  {
    variants: {
      collapsed: {
        true: [],
        false: [],
      },
    },
    defaultVariants: {
      collapsed: false,
    },
  }
);

export const layoutClass = (variants: VariantProps<typeof layoutVariants>) => twMerge(layoutVariants(variants));
export const headerClass = (variants: VariantProps<typeof headerVariants>) => twMerge(headerVariants(variants));
export const footerClass = (variants: VariantProps<typeof footerVariants>) => twMerge(footerVariants(variants));
export const contentClass = (variants: VariantProps<typeof contentVariants>) => twMerge(contentVariants(variants));
export const siderClass = (variants: VariantProps<typeof siderVariants>) => twMerge(siderVariants(variants));
