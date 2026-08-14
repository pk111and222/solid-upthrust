// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const dropdownOverlayVariants = cva(
  ["bg-surface", "rounded-lg", "shadow-md", "border", "border-outline/10", "py-1", "min-w-32", "transition-all", "duration-200"],
  {
    variants: {
      visible: {
        true: ["opacity-100", "scale-100"],
        false: ["opacity-0", "scale-95", "pointer-events-none"],
      },
    },
    defaultVariants: { visible: false },
  }
);

const dropdownItemVariants = cva(
  ["flex", "items-center", "px-3", "py-2", "text-sm", "cursor-pointer", "transition-colors", "gap-2"],
  {
    variants: {
      active: {
        true: ["bg-primary/10", "text-primary"],
        false: ["text-on-surface", "hover:bg-surface-variant/40"],
      },
      disabled: {
        true: ["opacity-40", "cursor-not-allowed", "pointer-events-none"],
        false: [],
      },
      danger: {
        true: ["text-error", "hover:bg-error/10"],
        false: [],
      },
    },
    defaultVariants: { active: false, disabled: false, danger: false },
  }
);

const dropdownDividerVariants = cva(
  ["border-t", "border-outline/10", "my-1"],
  { variants: {}, defaultVariants: {} }
);

export const dropdownOverlayClass = (variants: VariantProps<typeof dropdownOverlayVariants>) => twMerge(dropdownOverlayVariants(variants));
export const dropdownItemClass = (variants: VariantProps<typeof dropdownItemVariants>) => twMerge(dropdownItemVariants(variants));
export const dropdownDividerClass = (variants: VariantProps<typeof dropdownDividerVariants>) => twMerge(dropdownDividerVariants(variants));
