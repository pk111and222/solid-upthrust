// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const iconVariants = cva(
  [
    "inline-block", "align-middle", "transition-upthrust-fast"
  ],
  {
    variants: {
      size: {
        small: ["text-[14px]"],
        middle: ["text-[16px]"],
        large: ["text-[20px]"],
      },
      color: {
        primary: ["text-primary"],
        secondary: ["text-on-surface-variant"],
        success: ["text-green-600"],
        warning: ["text-amber-600"],
        danger: ["text-error"],
        inherit: ["text-current"],
      },
      spin: {
        true: ["animate-spin"],
        false: [],
      },
    },
    defaultVariants: {
      size: "middle",
      color: "inherit",
      spin: false,
    },
  }
);

export const iconClass = (variants: VariantProps<typeof iconVariants>) => twMerge(iconVariants(variants));
