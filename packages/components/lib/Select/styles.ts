// @unocss-include
import { twMerge } from "tailwind-merge";

/**
 * Select styles — antd6 spec:
 *  - selector: the input frame — same border/radius/height family as Input
 *    (h-control, border-outline, hover/focus primary + 2px ring), padding
 *    11px with a suffix-icon slot (down-chevron that flips when open)
 *  - multiple: tags wrap inside the frame; the frame grows with them
 *  - tag: the selected chip (antd: bg-on-surface/6, rounded-sm, 20px tall,
 *    × on hover); maxTagCount collapses the rest into "+N …"
 *  - search input: inline borderless input inside the selector (mirrors
 *    Input's innerInput contract)
 *  - dropdown: bg-surface rounded-lg shadow (the Dropdown overlay family),
 *    items 32px rows with selected (primary text + weight) and active
 *    (bg-on-surface/6) states, check mark on the right for selected
 *  - empty: the notFoundContent block (centered secondary text)
 */
import { cva, type VariantProps } from "class-variance-authority";

// ---------------------------------------------------------------------------
// Selector (the always-visible box)
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
        // Multiple grows with tags; horizontal padding follows the size variant.
        true: ["h-auto", "min-h-control", "py-[2px]"],
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
);

export const selectorClass = (variants: VariantProps<typeof selectorVariants>) =>
  twMerge(selectorVariants(variants));

/** The inline search input (mirrors Input's innerInput). */
export const searchInputClass = () =>
  twMerge([
    "flex-1",
    "min-w-0",
    "h-full",
    "bg-transparent",
    "outline-none",
    "border-none",
    "p-0",
    "text-on-surface",
    "placeholder:text-on-surface/25",
    "[color-scheme:light]",
    "cursor-auto",
  ]);

/** Placeholder / single-value display text. */
export const selectionItemClass = cva(
  [
    "block",
    "truncate",
    "flex-1",
    "min-w-0",
    "text-start",
    "select-none",
  ],
  {
    variants: {
      state: {
        placeholder: ["text-on-surface/25"],
        value: ["text-on-surface"],
      },
      size: {
        small: ["text-[12px]"],
        middle: ["text-[14px]"],
        large: ["text-[16px]"],
      },
    },
    defaultVariants: { state: "placeholder", size: "middle" },
  },
);

export const selectionItemWrapClass = (variants: VariantProps<typeof selectionItemClass>) =>
  twMerge(selectionItemClass(variants));

/** One stable slot for clear, loading and the down chevron. */
export const selectorSuffixClass = cva(
  [
    "flex",
    "items-center",
    "justify-center",
    "shrink-0",
    "ml-[4px]",
    "text-on-surface/45",
    "transition-upthrust-fast",
  ],
  {
    variants: {
      size: {
        small: ["w-[20px]", "h-[20px]", "text-[14px]"],
        middle: ["w-[24px]", "h-[24px]", "text-[16px]"],
        large: ["w-[28px]", "h-[28px]", "text-[18px]"],
      },
    },
    defaultVariants: { size: "middle" },
  },
);

export const selectorSuffixWrapClass = (variants: VariantProps<typeof selectorSuffixClass>) =>
  twMerge(selectorSuffixClass(variants));

/** The down-chevron arrow — rotates 180° while open (antd). */
export const selectorArrowClass = cva(
  ["transition-transform", "duration-200", "ease-upthrust", "flex", "items-center", "justify-center", "w-full", "h-full", "cursor-pointer"],
  {
    variants: {
      open: {
        true: ["rotate-180"],
        false: [],
      },
    },
    defaultVariants: { open: false },
  },
);

export const selectorArrowWrapClass = (variants: VariantProps<typeof selectorArrowClass>) =>
  twMerge(selectorArrowClass(variants));

/** The clear × replaces the arrow when allowClear and non-empty. */
export const selectorClearClass = cva(
  [
    "flex",
    "items-center",
    "justify-center",
    "shrink-0",
    "w-full",
    "h-full",
    "cursor-pointer",
    "text-on-surface/45",
    "hover:text-on-surface",
    "active:text-on-surface",
    "transition-upthrust-fast",
  ],
  {
    variants: {
      visible: {
        true: [],
        false: ["hidden"],
      },
    },
    defaultVariants: { visible: false },
  },
);

export const selectorClearWrapClass = (variants: VariantProps<typeof selectorClearClass>) =>
  twMerge(selectorClearClass(variants));

// ---------------------------------------------------------------------------
// Multiple-mode tags
// ---------------------------------------------------------------------------

export const selectTagClass = cva(
  [
    "inline-flex",
    "items-center",
    "gap-[4px]",
    "h-[20px]",
    "px-[8px]",
    "rounded-sm",
    "bg-on-surface/6",
    "text-[12px]",
    "leading-none",
    "text-on-surface",
    "max-w-full",
    "mr-[4px]",
    "mt-[1px]",
    "mb-[1px]",
  ],
  {
    variants: {
      disabled: {
        true: ["!text-on-surface/25", "cursor-not-allowed"],
        false: [],
      },
    },
    defaultVariants: { disabled: false },
  },
);

export const selectTagWrapClass = (variants: VariantProps<typeof selectTagClass>) =>
  twMerge(selectTagClass(variants));

export const selectTagCloseClass = cva(
  [
    "flex",
    "items-center",
    "justify-center",
    "text-[10px]",
    "text-on-surface/45",
    "cursor-pointer",
    "rounded-full",
    "transition-upthrust-fast",
    "hover:text-on-surface",
    "hover:bg-on-surface/15",
  ],
  {
    variants: {
      disabled: {
        true: ["invisible", "pointer-events-none"],
        false: [],
      },
    },
    defaultVariants: { disabled: false },
  },
);

export const selectTagCloseWrapClass = (variants: VariantProps<typeof selectTagCloseClass>) =>
  twMerge(selectTagCloseClass(variants));

/** The "+N …" overflow chip (maxTagCount). */
export const selectTagRestClass = () =>
  twMerge([
    "inline-flex",
    "items-center",
    "h-[20px]",
    "px-[8px]",
    "rounded-sm",
    "bg-on-surface/6",
    "text-[12px]",
    "leading-none",
    "text-on-surface-variant",
    "mr-[4px]",
    "mt-[1px]",
    "mb-[1px]",
    "select-none",
  ]);

// ---------------------------------------------------------------------------
// Dropdown
// ---------------------------------------------------------------------------

/** The floating listbox — same overlay family as Dropdown. */
export const selectDropdownClass = cva(
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
    "overflow-auto",
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

export const selectDropdownWrapClass = (variants: VariantProps<typeof selectDropdownClass> & { maxHeight?: string }) =>
  twMerge(selectDropdownClass(variants));

/** One option row. */
export const selectOptionClass = cva(
  [
    "flex",
    "items-center",
    "justify-between",
    "px-[12px]",
    "py-[5px]",
    "text-[14px]",
    "cursor-pointer",
    "transition-upthrust-fast",
    "text-on-surface",
    "outline-none",
  ],
  {
    variants: {
      selected: {
        true: ["!text-primary", "font-medium"],
        false: [],
      },
      active: {
        true: ["bg-on-surface/6"],
        false: ["hover:bg-on-surface/6"],
      },
      disabled: {
        true: ["!text-on-surface/25", "cursor-not-allowed", "pointer-events-none", "hover:bg-transparent"],
        false: [],
      },
    },
    defaultVariants: { selected: false, active: false, disabled: false },
  },
);

export const selectOptionWrapClass = (variants: VariantProps<typeof selectOptionClass>) =>
  twMerge(selectOptionClass(variants));

/** The check mark next to a selected option. */
export const selectOptionCheckClass = cva(
  ["flex", "items-center", "text-[12px]", "text-primary", "transition-upthrust-fast"],
  {
    variants: {
      visible: {
        true: ["opacity-100", "scale-100"],
        false: ["opacity-0", "scale-0"],
      },
    },
    defaultVariants: { visible: false },
  },
);

export const selectOptionCheckWrapClass = (variants: VariantProps<typeof selectOptionCheckClass>) =>
  twMerge(selectOptionCheckClass(variants));

/** The not-found block. */
export const selectEmptyClass = () =>
  twMerge([
    "flex",
    "items-center",
    "justify-center",
    "py-[12px]",
    "px-[12px]",
    "text-[14px]",
    "text-on-surface/25",
    "select-none",
  ]);
