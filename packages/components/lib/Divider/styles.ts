// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const dividerVariants = cva(
  [
    "border-0", "border-outline/20"
  ],
  {
    variants: {
      type: {
        horizontal: ["w-full", "my-6", "border-t", "border-solid"],
        vertical: ["inline-block", "align-middle", "h-[0.9em]", "mx-2", "border-l", "border-solid", "self-stretch"],
      },
      dashed: {
        true: ["border-dashed"],
        false: [],
      },
      plain: {
        true: ["font-normal", "text-sm"],
        false: ["font-semibold"],
      },
    },
    defaultVariants: {
      type: "horizontal",
      dashed: false,
      plain: false,
    },
  }
);

const dividerTextVariants = cva(
  [
    "inline-flex", "items-center", "whitespace-nowrap",
    "text-on-surface", "text-sm", "font-semibold",
  ],
  {
    variants: {
      orientation: {
        left: [],
        center: [],
        right: [],
      },
      plain: {
        true: ["font-normal", "text-sm"],
        false: ["font-semibold"],
      },
    },
    defaultVariants: {
      orientation: "center",
      plain: false,
    },
  }
);

export const dividerClass = (variants: VariantProps<typeof dividerVariants>) => twMerge(dividerVariants(variants));
export const dividerTextClass = (variants: VariantProps<typeof dividerTextVariants>) => twMerge(dividerTextVariants(variants));
