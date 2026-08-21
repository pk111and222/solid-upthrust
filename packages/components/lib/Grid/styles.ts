// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const rowVariants = cva(
  ["flex"],
  {
    variants: {
      justify: {
        start: ["justify-start"],
        center: ["justify-center"],
        end: ["justify-end"],
        "space-between": ["justify-between"],
        "space-around": ["justify-around"],
        "space-evenly": ["justify-evenly"],
      },
      align: {
        top: ["items-start"],
        middle: ["items-center"],
        bottom: ["items-end"],
        stretch: ["items-stretch"],
      },
      wrap: {
        true: ["flex-wrap"],
        false: ["flex-nowrap"],
      },
    },
    defaultVariants: {
      justify: "start",
      align: "top",
      wrap: true,
    },
  }
);

const colVariants = cva(
  ["relative", "max-w-full"],
  { variants: {}, defaultVariants: {} }
);

export type RowStyleVariants = VariantProps<typeof rowVariants>;
export const rowClass = (variants: RowStyleVariants) => twMerge(rowVariants(variants));
export const colClass = (variants: VariantProps<typeof colVariants>) => twMerge(colVariants(variants));
