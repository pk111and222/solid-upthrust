// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const anchorContainerVariants = cva(
  ["relative"],
  {
    variants: {
      direction: {
        vertical: [],
        horizontal: ["flex", "items-center", "gap-0", "border-b", "border-outline-variant"],
      },
    },
    defaultVariants: { direction: "vertical" },
  }
);

// Merged active × direction variant keys instead of compoundVariants —
// UnoCSS static scanning cannot extract classes from compoundVariants.
const anchorLinkVariants = cva(
  [
    "block", "py-[4px]", "text-[14px]", "text-on-surface-variant",
    "transition-upthrust-fast", "cursor-pointer", "no-underline", "hover:text-primary",
  ],
  {
    variants: {
      direction: {
        vertical: ["pl-[16px]", "border-l-2", "border-transparent", "-ml-[1px]"],
        horizontal: ["px-[16px]", "pb-[8px]", "border-b-2", "border-transparent", "-mb-[1px]"],
      },
      state: {
        idle: [],
        "active-vertical": ["text-primary", "border-l-primary"],
        "active-horizontal": ["text-primary", "border-b-primary"],
      },
    },
    defaultVariants: { direction: "vertical", state: "idle" },
  }
);

// Sliding ink indicator (has a small ball/wand under the active
// link; the ink bar animates between link positions).
const anchorInkVariants = cva(
  ["absolute", "bg-primary", "transition-all", "duration-mid", "ease-upthrust", "pointer-events-none"],
  {
    variants: {
      direction: {
        vertical: ["left-0", "w-[2px]"],
        horizontal: ["bottom-0", "h-[2px]"],
      },
    },
    defaultVariants: { direction: "vertical" },
  }
);

export const anchorContainerClass = (variants: VariantProps<typeof anchorContainerVariants>) => twMerge(anchorContainerVariants(variants));
export const anchorLinkClass = (variants: VariantProps<typeof anchorLinkVariants>) => twMerge(anchorLinkVariants(variants));
export const anchorInkClass = (variants: VariantProps<typeof anchorInkVariants>) => twMerge(anchorInkVariants(variants));

export type AnchorLinkVariants = VariantProps<typeof anchorLinkVariants>;
