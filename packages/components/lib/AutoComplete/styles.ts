// @unocss-include
import { twMerge } from "tailwind-merge";

/**
 * AutoComplete styles — the selector is a plain Input frame (text input,
 * not a combobox picker); the dropdown is the Dropdown overlay family
 * (single column of 32px rows). Mirrors Select's dropdown rows.
 */
import { cva, type VariantProps } from "class-variance-authority";

const autoCompleteDropdownVariants = cva(
  [
    "bg-surface", "rounded-lg", "shadow", "py-[4px]",
    "max-h-[264px]", "overflow-y-auto",
    "transition-overlay", "duration-fast", "ease-upthrust", "origin-top",
    "outline-none",
  ],
  {
    variants: {
      visible: {
        true: ["opacity-100", "scale-100"],
        false: ["opacity-0", "scale-95", "pointer-events-none"],
      },
      placement: {
        bottomLeft: ["origin-top-left"],
        bottomRight: ["origin-top-right"],
        bottom: ["origin-top"],
        topLeft: ["origin-bottom-left"],
        topRight: ["origin-bottom-right"],
        top: ["origin-bottom"],
        leftTop: ["origin-top-right"],
        leftBottom: ["origin-bottom-right"],
        left: ["origin-right"],
        rightTop: ["origin-top-left"],
        rightBottom: ["origin-bottom-left"],
        right: ["origin-left"],
      },
    },
    defaultVariants: { visible: false, placement: "bottomLeft" },
  },
);

export const autoCompleteDropdownClass = (variants: VariantProps<typeof autoCompleteDropdownVariants>) =>
  twMerge(autoCompleteDropdownVariants(variants));

/** One suggestion row. */
export const autoCompleteOptionClass = cva(
  [
    "flex", "items-center", "justify-between", "gap-[8px]",
    "px-[12px]", "py-[5px]", "text-[14px]",
    "cursor-pointer", "transition-upthrust-fast", "text-on-surface",
    "outline-none", "whitespace-nowrap",
  ],
  {
    variants: {
      active: { true: ["bg-on-surface/6"], false: ["hover:bg-on-surface/6"] },
      selected: { true: ["!text-primary", "font-medium"], false: [] },
      disabled: {
        true: ["!text-on-surface/25", "cursor-not-allowed", "pointer-events-none", "hover:bg-transparent"],
        false: [],
      },
    },
    defaultVariants: { active: false, selected: false, disabled: false },
  },
);

export const autoCompleteOptionWrapClass = (variants: VariantProps<typeof autoCompleteOptionClass>) =>
  twMerge(autoCompleteOptionClass(variants));

/** Empty block. */
export const autoCompleteEmptyClass = () =>
  twMerge([
    "flex", "items-center", "justify-center",
    "py-[12px]", "px-[12px]", "text-[14px]", "text-on-surface/25", "select-none",
  ]);
