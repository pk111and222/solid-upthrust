// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const menuContainerVariants = cva(
  ["text-[14px]", "text-on-surface", "bg-transparent"],
  {
    variants: {
      mode: {
        vertical: ["flex", "flex-col"],
        horizontal: ["flex", "flex-row", "items-center", "border-b", "border-outline-variant"],
        inline: ["flex", "flex-col"],
      },
    },
    defaultVariants: { mode: "vertical" },
  }
);

// Merged selected × mode variant keys instead of compoundVariants —
// UnoCSS static scanning cannot extract visual classes from compoundVariants.
const menuItemVariants = cva(
  [
    "flex", "items-center", "gap-2", "cursor-pointer",
    "transition-upthrust-fast", "outline-none", "whitespace-nowrap",
  ],
  {
    variants: {
      state: {
        idle: [],
        // vertical/inline selected: primary tint pill
        "selected-vertical": ["bg-primary-container/15", "text-primary", "font-medium", "hover:bg-primary-container/15"],
        "selected-inline": ["bg-primary-container/15", "text-primary", "font-medium", "hover:bg-primary-container/15"],
        // horizontal selected: 2px primary underline, transparent bg
        "selected-horizontal": ["border-b-primary", "text-primary", "bg-transparent", "font-medium"],
      },
      disabled: {
        true: ["opacity-40", "cursor-not-allowed", "pointer-events-none", "hover:bg-transparent"],
        false: [],
      },
      danger: {
        true: ["text-error", "hover:bg-error/10"],
        false: [],
      },
      mode: {
        vertical: ["min-h-[40px]", "rounded", "mx-1", "my-0.5", "px-4", "hover:bg-on-surface/6"],
        horizontal: ["h-[46px]", "border-b-2", "border-transparent", "rounded-none", "mx-0", "px-[20px]", "hover:bg-on-surface/4"],
        inline: ["min-h-[40px]", "rounded", "mx-1", "my-0.5", "px-4", "hover:bg-on-surface/6"],
      },
    },
    defaultVariants: { state: "idle", disabled: false, danger: false, mode: "vertical" },
  }
);

// Horizontal submenu: floating overlay (popup behavior) instead of
// pushing content down.
// Positioned by createTrigger's layerStyle (top/left px values) inside a
// Portal — static CSS positioning removed.
const menuSubPopupVariants = cva(
  [
    "min-w-[160px]", "bg-surface",
    "rounded-lg", "shadow", "py-1",
    // Only opacity/scale — position changes come from createTrigger and must
    // never animate (transition-all would make the popup fly across screen).
    "transition-overlay", "duration-fast", "ease-upthrust", "origin-top-left",
  ],
  {
    variants: {
      open: {
        true: ["opacity-100", "scale-100"],
        false: ["opacity-0", "scale-95", "pointer-events-none"],
      },
    },
    defaultVariants: { open: false },
  }
);

const menuSubTitleVariants = cva(
  [
    "flex", "items-center", "justify-between", "gap-2", "cursor-pointer",
    "transition-upthrust-fast", "text-on-surface",
  ],
  {
    variants: {
      open: {
        true: ["text-primary"],
        false: [],
      },
      mode: {
        vertical: ["min-h-[40px]", "rounded", "mx-1", "my-0.5", "px-4", "hover:bg-on-surface/6"],
        horizontal: ["h-[46px]", "rounded-none", "mx-0", "px-[20px]", "hover:bg-on-surface/4"],
        inline: ["min-h-[40px]", "rounded", "mx-1", "my-0.5", "px-4", "hover:bg-on-surface/6"],
      },
    },
    defaultVariants: { open: false, mode: "vertical" },
  }
);

const menuGroupTitleVariants = cva(
  ["px-4", "py-2", "text-[12px]", "text-on-surface-variant/60", "tracking-wider", "select-none"],
  { variants: {}, defaultVariants: {} }
);

const menuDividerVariants = cva(
  ["border-t", "border-outline-variant", "my-1", "mx-2"],
  { variants: {}, defaultVariants: {} }
);

const menuSubContentVariants = cva(
  ["overflow-hidden", "transition-all", "duration-mid", "ease-upthrust"],
  {
    variants: {
      open: {
        true: ["max-h-96", "opacity-100"],
        false: ["max-h-0", "opacity-0"],
      },
    },
    defaultVariants: { open: false },
  }
);

export const menuContainerClass = (variants: VariantProps<typeof menuContainerVariants>) => twMerge(menuContainerVariants(variants));
export const menuItemClass = (variants: VariantProps<typeof menuItemVariants>) => twMerge(menuItemVariants(variants));
export const menuSubTitleClass = (variants: VariantProps<typeof menuSubTitleVariants>) => twMerge(menuSubTitleVariants(variants));
export const menuSubPopupClass = (variants: VariantProps<typeof menuSubPopupVariants>) => twMerge(menuSubPopupVariants(variants));
export const menuGroupTitleClass = (variants: VariantProps<typeof menuGroupTitleVariants>) => twMerge(menuGroupTitleVariants(variants));
export const menuDividerClass = (variants: VariantProps<typeof menuDividerVariants>) => twMerge(menuDividerVariants(variants));
export const menuSubContentClass = (variants: VariantProps<typeof menuSubContentVariants>) => twMerge(menuSubContentVariants(variants));
