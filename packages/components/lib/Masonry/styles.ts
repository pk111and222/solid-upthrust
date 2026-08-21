// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const masonryVariants = cva(
  ["flex"],
  {
    variants: {
      gutter: {
        small: ["gap-xs"],
        middle: ["gap-md"],
        large: ["gap-lg"],
      },
    },
    defaultVariants: {},
  }
);

const masonryColumnVariants = cva(
  ["flex-1", "flex", "flex-col"],
  {
    variants: {
      gutter: {
        small: ["gap-xs"],
        middle: ["gap-md"],
        large: ["gap-lg"],
      },
    },
    defaultVariants: {},
  }
);

export type MasonryStyleVariants = VariantProps<typeof masonryVariants>;
export const masonryClass = (variants: MasonryStyleVariants) => twMerge(masonryVariants(variants));
export const masonryColumnClass = (variants: VariantProps<typeof masonryColumnVariants>) => twMerge(masonryColumnVariants(variants));
