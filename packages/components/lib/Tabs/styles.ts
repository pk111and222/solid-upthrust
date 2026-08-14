// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const tabsContainerVariants = cva(
  ["flex", "w-full"],
  {
    variants: {
      tabPosition: {
        top: ["flex-col"],
        bottom: ["flex-col-reverse"],
        left: ["flex-row"],
        right: ["flex-row-reverse"],
      },
    },
    defaultVariants: { tabPosition: "top" },
  }
);

const tabBarVariants = cva(
  ["flex", "relative", "shrink-0"],
  {
    variants: {
      tabPosition: {
        top: ["flex-row", "border-b", "border-outline/20"],
        bottom: ["flex-row", "border-t", "border-outline/20"],
        left: ["flex-col", "border-r", "border-outline/20"],
        right: ["flex-col", "border-l", "border-outline/20"],
      },
      type: {
        line: [],
        card: ["gap-0.5"],
      },
      centered: {
        true: ["justify-center"],
        false: [],
      },
    },
    defaultVariants: { tabPosition: "top", type: "line", centered: false },
  }
);

const tabItemVariants = cva(
  ["px-4", "py-2", "cursor-pointer", "transition-colors", "relative", "select-none", "whitespace-nowrap", "text-sm"],
  {
    variants: {
      active: {
        true: ["text-primary"],
        false: ["text-on-surface-variant", "hover:text-primary/70"],
      },
      disabled: {
        true: ["opacity-40", "cursor-not-allowed", "pointer-events-none"],
        false: [],
      },
      type: {
        line: [],
        card: ["rounded-t", "border", "border-outline/20", "border-b-transparent"],
      },
      size: {
        small: ["px-3", "py-1", "text-xs"],
        middle: ["px-4", "py-2", "text-sm"],
        large: ["px-5", "py-3", "text-base"],
      },
    },
    compoundVariants: [
      { type: "card", active: true, class: ["bg-surface", "border-b-surface"] },
      { type: "card", active: false, class: ["bg-surface-variant/20"] },
    ],
    defaultVariants: { active: false, disabled: false, type: "line", size: "middle" },
  }
);

const tabInkBarVariants = cva(
  ["absolute", "bg-primary", "transition-all", "duration-300"],
  {
    variants: {
      tabPosition: {
        top: ["bottom-0", "h-0.5"],
        bottom: ["top-0", "h-0.5"],
        left: ["right-0", "w-0.5"],
        right: ["left-0", "w-0.5"],
      },
    },
    defaultVariants: { tabPosition: "top" },
  }
);

const tabPanelVariants = cva(
  ["py-4", "flex-1", "min-w-0"],
  { variants: {}, defaultVariants: {} }
);

export const tabsContainerClass = (variants: VariantProps<typeof tabsContainerVariants>) => twMerge(tabsContainerVariants(variants));
export const tabBarClass = (variants: VariantProps<typeof tabBarVariants>) => twMerge(tabBarVariants(variants));
export const tabItemClass = (variants: VariantProps<typeof tabItemVariants>) => twMerge(tabItemVariants(variants));
export const tabInkBarClass = (variants: VariantProps<typeof tabInkBarVariants>) => twMerge(tabInkBarVariants(variants));
export const tabPanelClass = (variants: VariantProps<typeof tabPanelVariants>) => twMerge(tabPanelVariants(variants));
