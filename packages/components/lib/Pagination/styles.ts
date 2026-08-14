// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const paginationContainerVariants = cva(
  ["flex", "items-center", "gap-1"],
  {
    variants: {
      align: {
        start: ["justify-start"],
        center: ["justify-center"],
        end: ["justify-end"],
      },
    },
    defaultVariants: { align: "start" },
  }
);

const paginationItemVariants = cva(
  ["flex", "items-center", "justify-center", "rounded", "cursor-pointer", "select-none", "transition-colors", "border", "border-transparent"],
  {
    variants: {
      active: {
        true: ["bg-primary", "text-on-primary", "border-primary"],
        false: ["text-on-surface", "hover:bg-surface-variant/40", "hover:border-outline/30"],
      },
      disabled: {
        true: ["opacity-40", "cursor-not-allowed", "pointer-events-none"],
        false: [],
      },
      size: {
        default: ["w-8", "h-8", "text-sm"],
        small: ["w-7", "h-7", "text-xs"],
      },
    },
    defaultVariants: { active: false, disabled: false, size: "default" },
  }
);

const paginationEllipsisVariants = cva(
  ["flex", "items-center", "justify-center", "text-on-surface-variant", "select-none"],
  {
    variants: {
      size: {
        default: ["w-8", "h-8", "text-sm"],
        small: ["w-7", "h-7", "text-xs"],
      },
    },
    defaultVariants: { size: "default" },
  }
);

export const paginationContainerClass = (variants: VariantProps<typeof paginationContainerVariants>) => twMerge(paginationContainerVariants(variants));
export const paginationItemClass = (variants: VariantProps<typeof paginationItemVariants>) => twMerge(paginationItemVariants(variants));
export const paginationEllipsisClass = (variants: VariantProps<typeof paginationEllipsisVariants>) => twMerge(paginationEllipsisVariants(variants));
