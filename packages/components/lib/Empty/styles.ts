// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const emptyVariants = cva(
  ["flex", "flex-col", "items-center", "justify-center", "text-center", "w-full"],
  { variants: {}, defaultVariants: {} }
);

// description text under the image
const emptyDescriptionVariants = cva(
  ["text-on-surface-variant", "text-[14px]", "mt-[8px]"],
  { variants: {}, defaultVariants: {} }
);

// children slot (footer content)
const emptyFooterVariants = cva(
  ["mt-[16px]"],
  { variants: {}, defaultVariants: {} }
);

export const emptyClass = (variants: VariantProps<typeof emptyVariants>) => twMerge(emptyVariants(variants));
export const emptyDescriptionClass = (variants: VariantProps<typeof emptyDescriptionVariants>) => twMerge(emptyDescriptionVariants(variants));
export const emptyFooterClass = (variants: VariantProps<typeof emptyFooterVariants>) => twMerge(emptyFooterVariants(variants));
