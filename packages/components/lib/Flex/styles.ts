// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const flexVariants = cva(
  [],
  {
    variants: {
      vertical: {
        true: ["flex-col"],
        false: ["flex-row"],
      },
      wrap: {
        wrap: ["flex-wrap"],
        nowrap: ["flex-nowrap"],
        "wrap-reverse": ["flex-wrap-reverse"],
      },
      justify: {
        "flex-start": ["justify-start"],
        center: ["justify-center"],
        "flex-end": ["justify-end"],
        "space-between": ["justify-between"],
        "space-around": ["justify-around"],
        "space-evenly": ["justify-evenly"],
        normal: [],
      },
      align: {
        "flex-start": ["items-start"],
        center: ["items-center"],
        "flex-end": ["items-end"],
        stretch: ["items-stretch"],
        baseline: ["items-baseline"],
        normal: [],
      },
      inline: {
        true: ["inline-flex"],
        false: ["flex"],
      },
    },
    defaultVariants: {
      vertical: false,
      wrap: "nowrap",
      justify: "normal",
      align: "normal",
      inline: false,
    },
  }
);

export type FlexStyleVariants = VariantProps<typeof flexVariants>;
export const flexClass = (variants: FlexStyleVariants) => twMerge(flexVariants(variants));
