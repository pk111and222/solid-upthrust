// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const splitterVariants = cva(
  ["flex", "w-full", "h-full", "relative"],
  {
    variants: {
      layout: {
        horizontal: ["flex-row"],
        vertical: ["flex-col"],
      },
    },
    defaultVariants: { layout: "horizontal" },
  }
);

// The bar takes 0px in flex layout; visible line + hit area are pseudo-elements
const splitterBarVariants = cva(
  [
    "relative", "shrink-0", "z-1", "select-none", "group", "touch-none",
    "focus:outline-none",
    // keyboard focus indicator: 2px primary line (much stronger than a 1px color swap)
    "focus-visible:before:w-[2px]", "focus-visible:before:bg-primary",
  ],
  {
    variants: {
      layout: {
        horizontal: [
          "w-0", "cursor-col-resize",
          // visible 1px line
          "before:absolute", "before:content-['']", "before:inset-y-0", "before:left-0", "before:w-[1px]", "before:-translate-x-1/2",
          "before:bg-outline-variant/40", "before:transition-upthrust-fast",
          // wider hit area
          "after:absolute", "after:content-['']", "after:inset-y-0", "after:left-1/2", "after:w-3", "after:-translate-x-1/2",
        ],
        vertical: [
          "h-0", "cursor-row-resize",
          // visible 1px line
          "before:absolute", "before:content-['']", "before:inset-x-0", "before:top-0", "before:h-[1px]", "before:-translate-y-1/2",
          "before:bg-outline-variant/40", "before:transition-upthrust-fast",
          // wider hit area
          "after:absolute", "after:content-['']", "after:inset-x-0", "after:top-1/2", "after:h-3", "after:-translate-y-1/2",
        ],
      },
      active: {
        true: ["before:bg-primary"],
        false: [],
      },
      disabled: {
        true: ["cursor-default", "before:bg-outline-variant/20"],
        false: [],
      },
    },
    defaultVariants: { layout: "horizontal", active: false, disabled: false },
  }
);

// Small dragger handle capsule (centered on bar, shown on hover)
const splitterDraggerVariants = cva(
  [
    "absolute", "z-2", "rounded-full",
    "bg-on-surface/15", "transition-upthrust-fast",
    "opacity-0", "group-hover:opacity-100",
  ],
  {
    variants: {
      layout: {
        horizontal: ["left-1/2", "top-1/2", "-translate-x-1/2", "-translate-y-1/2", "w-[3px]", "h-6"],
        vertical: ["left-1/2", "top-1/2", "-translate-x-1/2", "-translate-y-1/2", "h-[3px]", "w-6"],
      },
      active: {
        true: ["opacity-100", "bg-primary"],
        false: [],
      },
      focused: {
        true: ["opacity-100"],
        false: [],
      },
    },
    defaultVariants: { layout: "horizontal", active: false, focused: false },
  }
);

const splitterPanelVariants = cva(
  ["relative", "overflow-auto", "shrink-0", "min-w-0", "min-h-0"],
  {
    variants: {
      layout: {
        horizontal: ["h-full"],
        vertical: ["w-full"],
      },
    },
    defaultVariants: { layout: "horizontal" },
  }
);

export type SplitterStyleVariants = VariantProps<typeof splitterVariants>;
export const splitterClass = (variants: VariantProps<typeof splitterVariants>) => twMerge(splitterVariants(variants));
export const splitterBarClass = (variants: VariantProps<typeof splitterBarVariants>) => twMerge(splitterBarVariants(variants));
export const splitterDraggerClass = (variants: VariantProps<typeof splitterDraggerVariants>) => twMerge(splitterDraggerVariants(variants));
export const splitterPanelClass = (variants: VariantProps<typeof splitterPanelVariants>) => twMerge(splitterPanelVariants(variants));
