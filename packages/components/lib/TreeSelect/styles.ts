// @unocss-include
import { twMerge } from "tailwind-merge";

/**
 * TreeSelect styles — antd6 spec. The selector reuses the Select/Cascader
 * frame family verbatim (copy, not cross-import — the Cascader precedent);
 * the dropdown is the Dropdown overlay family hosting the embedded Tree.
 */
import { cva, type VariantProps } from "class-variance-authority";

// ---------------------------------------------------------------------------
// Selector (the always-visible box) — same frame contract as Select
// ---------------------------------------------------------------------------

const selectorVariants = cva(
  [
    "relative",
    "inline-flex",
    "items-center",
    "w-full",
    "min-w-0",
    "bg-surface",
    "rounded",
    "border",
    "border-solid",
    "border-outline",
    "transition-upthrust",
    "cursor-pointer",
    "text-on-surface",
    "hover:border-primary",
    "focus-within:border-primary",
    "focus-within:ring-2",
    "focus-within:ring-primary/10",
  ],
  {
    variants: {
      size: {
        small: ["h-control-sm", "text-[12px]", "px-[7px]"],
        middle: ["h-control", "text-[14px]", "px-[11px]"],
        large: ["h-control-lg", "text-[16px]", "px-[11px]"],
      },
      open: {
        true: ["!border-primary", "ring-2", "ring-primary/10"],
        false: [],
      },
      disabled: {
        true: [
          "!bg-on-surface/4",
          "!border-on-surface/15",
          "cursor-not-allowed",
          "hover:!border-on-surface/15",
          "focus-within:!ring-transparent",
        ],
        false: [],
      },
      status: {
        default: [],
        error: ["!border-error", "hover:!border-error", "focus-within:!border-error", "focus-within:!ring-error/8"],
        warning: ["!border-[#faad14]", "hover:!border-[#faad14]", "focus-within:!border-[#faad14]", "focus-within:!ring-[#faad14]/10"],
      },
      multiple: {
        true: ["h-auto", "min-h-control", "py-[2px]", "px-[4px]"],
        false: [],
      },
    },
    defaultVariants: {
      size: "middle",
      open: false,
      disabled: false,
      status: "default",
      multiple: false,
    },
  },
)

export const treeSelectSelectorClass = (variants: VariantProps<typeof selectorVariants>) =>
  twMerge(selectorVariants(variants));

/** The inline search input (mirrors Select's). */
export const treeSelectSearchInputClass = () =>
  twMerge([
    "flex-1",
    "min-w-0",
    "bg-transparent",
    "outline-none",
    "border-none",
    "p-0",
    "text-on-surface",
    "placeholder:text-on-surface/25",
    "cursor-text",
  ])

/** The single-mode label / placeholder text. */
export const treeSelectItemClass = (variants: { state?: 'value' | 'placeholder'; size?: 'small' | 'middle' | 'large' }) =>
  twMerge([
    "truncate", "min-w-0",
    variants.state === 'placeholder' ? 'text-on-surface/25' : 'text-on-surface',
    variants.size === 'small' ? 'text-[12px]' : '',
    variants.size === 'middle' ? 'text-[14px]' : '',
    variants.size === 'large' ? 'text-[16px]' : '',
  ])

/** A selected tag (multiple). */
const treeSelectTagVariants = cva(
  [
    "inline-flex", "items-center", "gap-[4px]",
    "max-w-full", "shrink",
    "h-[20px]", "px-[6px]", "rounded-sm",
    "bg-on-surface/6",
    "text-[12px]", "text-on-surface",
    "mr-[4px]", "mt-[1px]",
  ],
  {
    variants: {
      disabled: {
        true: ["opacity-45"],
        false: [],
      },
    },
    defaultVariants: { disabled: false },
  },
)

export const treeSelectTagWrapClass = (variants: VariantProps<typeof treeSelectTagVariants>) =>
  twMerge(treeSelectTagVariants(variants));

/** The tag × close button. */
export const treeSelectTagCloseWrapClass = () =>
  twMerge([
    "flex", "items-center", "justify-center",
    "w-[14px]", "h-[14px]", "rounded-sm",
    "text-[10px]", "cursor-pointer",
    "text-on-surface/45", "hover:text-on-surface", "hover:bg-on-surface/6",
    "transition-upthrust-fast",
  ])

/** The "+N …" collapsed counter (maxTagCount). */
export const treeSelectTagRestClass = () =>
  twMerge([
    "inline-flex", "items-center",
    "h-[20px]", "px-[6px]", "rounded-sm",
    "bg-on-surface/6", "text-[12px]", "text-on-surface/45",
    "mr-[4px]", "mt-[1px]",
  ])

/** The suffix slot (clear × + down-chevron). */
export const treeSelectSuffixWrapClass = (variants: { size?: 'small' | 'middle' | 'large' }) =>
  twMerge([
    "flex", "items-center", "justify-center", "shrink-0", "ml-auto", "text-on-surface/45",
    variants.size === 'small' ? 'w-[20px] h-[20px] text-[14px]' : variants.size === 'large' ? 'w-[28px] h-[28px] text-[18px]' : 'w-[24px] h-[24px] text-[16px]',
  ])

/** The clear × button. */
export const treeSelectClearWrapClass = (variants: { visible?: boolean }) =>
  twMerge([
    "flex", "items-center", "justify-center", "cursor-pointer",
    "text-on-surface/25", "hover:text-on-surface/45", "active:text-on-surface",
    "transition-upthrust-fast",
    variants.visible ? '' : 'invisible pointer-events-none',
  ])

/** The down-chevron arrow — rotates 180° while open (antd). */
export const treeSelectArrowWrapClass = (variants: { open?: boolean }) =>
  twMerge([
    "transition-transform", "duration-200", "ease-upthrust", "flex", "items-center", "justify-center", "w-full", "h-full", "cursor-pointer",
    variants.open ? 'rotate-180' : '',
  ])

// ---------------------------------------------------------------------------
// Dropdown
// ---------------------------------------------------------------------------

const treeSelectDropdownVariants = cva(
  [
    "bg-surface",
    "rounded-lg",
    "shadow",
    "py-[4px]",
    "transition-overlay",
    "duration-fast",
    "ease-upthrust",
    "origin-top",
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
)

export const treeSelectDropdownWrapClass = (variants: VariantProps<typeof treeSelectDropdownVariants>) =>
  twMerge(treeSelectDropdownVariants(variants))

/** The empty state. */
export const treeSelectEmptyClass = () =>
  twMerge(["py-[8px]", "px-[12px]", "text-[14px]", "text-on-surface/25", "text-center", "select-none"])
