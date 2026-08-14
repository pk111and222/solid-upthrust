// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const masonryVariants = cva(
  [],
  {
    variants: {
      sequential: {
        true: [],
        false: [],
      },
    },
    defaultVariants: {
      sequential: false,
    },
  }
);

export const masonryClass = (variants: VariantProps<typeof masonryVariants>) => twMerge(masonryVariants(variants));
