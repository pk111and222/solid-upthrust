// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const dividerVariants = cva(
  ["border-0", "border-outline-variant/40"],
  {
    variants: {
      type: {
        horizontal: ["w-full", "my-lg", "border-t", "border-solid"],
        vertical: ["inline-block", "align-middle", "h-[0.9em]", "mx-xs", "border-l", "border-solid"],
      },
      dashed: {
        true: ["border-dashed"],
        false: [],
      },
      hasText: {
        true: ["!border-t-0", "!my-md", "flex", "items-center"],
        false: [],
      },
    },
    defaultVariants: {
      type: "horizontal",
      dashed: false,
      hasText: false,
    },
  }
);

const dividerTextVariants = cva(
  ["whitespace-nowrap", "px-md", "text-body", "text-on-surface"],
  {
    variants: {
      plain: {
        true: ["font-normal", "text-on-surface-variant"],
        false: ["font-medium"],
      },
    },
    defaultVariants: { plain: false },
  }
);

const dividerLineVariants = cva(
  ["flex-1", "border-0", "border-t", "border-solid", "border-outline-variant/40"],
  {
    variants: {
      dashed: {
        true: ["border-dashed"],
        false: [],
      },
    },
    defaultVariants: { dashed: false },
  }
);

export type DividerStyleVariants = VariantProps<typeof dividerVariants>;
export const dividerClass = (variants: DividerStyleVariants) => twMerge(dividerVariants(variants));
export const dividerTextClass = (variants: VariantProps<typeof dividerTextVariants>) => twMerge(dividerTextVariants(variants));
export const dividerLineClass = (variants: VariantProps<typeof dividerLineVariants>) => twMerge(dividerLineVariants(variants));
