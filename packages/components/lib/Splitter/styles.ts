// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const splitterVariants = cva(
  ["flex", "w-full", "h-full"],
  {
    variants: {
      layout: {
        horizontal: ["flex-row"],
        vertical: ["flex-col"],
      },
    },
    defaultVariants: {
      layout: "horizontal",
    },
  }
);

const splitterBarVariants = cva(
  [
    "relative", "flex-none", "flex", "items-center", "justify-center",
    "select-none", "transition-colors", "duration-100",
    "hover:bg-primary/10",
  ],
  {
    variants: {
      layout: {
        horizontal: ["w-2", "cursor-col-resize", "flex-col"],
        vertical: ["h-2", "cursor-row-resize", "flex-row"],
      },
      active: {
        true: ["bg-primary/15"],
        false: [],
      },
    },
    defaultVariants: {
      layout: "horizontal",
      active: false,
    },
  }
);

const splitterPanelVariants = cva(
  ["overflow-auto"],
  {
    variants: {
      layout: {
        horizontal: ["h-full"],
        vertical: ["w-full"],
      },
    },
    defaultVariants: {
      layout: "horizontal",
    },
  }
);

export const splitterClass = (variants: VariantProps<typeof splitterVariants>) => twMerge(splitterVariants(variants));
export const splitterBarClass = (variants: VariantProps<typeof splitterBarVariants>) => twMerge(splitterBarVariants(variants));
export const splitterPanelClass = (variants: VariantProps<typeof splitterPanelVariants>) => twMerge(splitterPanelVariants(variants));
