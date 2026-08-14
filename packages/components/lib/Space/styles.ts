// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const spaceVariants = cva(
  ["inline-flex"],
  {
    variants: {
      direction: {
        horizontal: ["flex-row", "items-center"],
        vertical: ["flex-col"],
      },
      wrap: {
        true: ["flex-wrap"],
        false: [],
      },
      align: {
        start: ["items-start"],
        center: ["items-center"],
        end: ["items-end"],
        baseline: ["items-baseline"],
      },
      block: {
        true: ["flex", "w-full"],
        false: [],
      },
    },
    defaultVariants: {
      direction: "horizontal",
      wrap: false,
      block: false,
    },
  }
);

const compactVariants = cva(
  ["inline-flex"],
  {
    variants: {
      direction: {
        horizontal: ["flex-row"],
        vertical: ["flex-col"],
      },
      block: {
        true: ["flex", "w-full"],
        false: [],
      },
    },
    defaultVariants: {
      direction: "horizontal",
      block: false,
    },
  }
);

export const spaceClass = (variants: VariantProps<typeof spaceVariants>) => twMerge(spaceVariants(variants));
export const compactClass = (variants: VariantProps<typeof compactVariants>) => twMerge(compactVariants(variants));
