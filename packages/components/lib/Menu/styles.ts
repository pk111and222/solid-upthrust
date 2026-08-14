// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const menuContainerVariants = cva(
  ["text-sm", "text-on-surface"],
  {
    variants: {
      mode: {
        vertical: ["flex", "flex-col"],
        horizontal: ["flex", "flex-row", "items-center", "border-b", "border-outline/20"],
        inline: ["flex", "flex-col"],
      },
    },
    defaultVariants: { mode: "vertical" },
  }
);

const menuItemVariants = cva(
  ["flex", "items-center", "gap-2", "px-4", "py-2.5", "cursor-pointer", "transition-colors", "rounded-md", "mx-1", "my-0.5"],
  {
    variants: {
      selected: {
        true: ["bg-primary/10", "text-primary", "font-medium"],
        false: ["hover:bg-surface-variant/30"],
      },
      disabled: {
        true: ["opacity-40", "cursor-not-allowed", "pointer-events-none"],
        false: [],
      },
      danger: {
        true: ["text-error", "hover:bg-error/10"],
        false: [],
      },
      mode: {
        vertical: [],
        horizontal: ["rounded-none", "mx-0", "my-0", "px-4", "py-3", "border-b-2", "border-transparent"],
        inline: [],
      },
    },
    compoundVariants: [
      { selected: true, mode: "horizontal", class: ["border-b-primary", "bg-transparent"] },
    ],
    defaultVariants: { selected: false, disabled: false, danger: false, mode: "vertical" },
  }
);

const menuSubTitleVariants = cva(
  ["flex", "items-center", "justify-between", "gap-2", "px-4", "py-2.5", "cursor-pointer", "transition-colors", "rounded-md", "mx-1", "my-0.5", "hover:bg-surface-variant/30"],
  {
    variants: {
      open: {
        true: ["text-primary"],
        false: ["text-on-surface"],
      },
    },
    defaultVariants: { open: false },
  }
);

const menuGroupTitleVariants = cva(
  ["px-4", "py-2", "text-xs", "font-bold", "text-on-surface-variant/60", "uppercase", "tracking-wider"],
  { variants: {}, defaultVariants: {} }
);

const menuDividerVariants = cva(
  ["border-t", "border-outline/10", "my-1", "mx-2"],
  { variants: {}, defaultVariants: {} }
);

const menuSubContentVariants = cva(
  ["overflow-hidden", "transition-all", "duration-200"],
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
export const menuGroupTitleClass = (variants: VariantProps<typeof menuGroupTitleVariants>) => twMerge(menuGroupTitleVariants(variants));
export const menuDividerClass = (variants: VariantProps<typeof menuDividerVariants>) => twMerge(menuDividerVariants(variants));
export const menuSubContentClass = (variants: VariantProps<typeof menuSubContentVariants>) => twMerge(menuSubContentVariants(variants));
