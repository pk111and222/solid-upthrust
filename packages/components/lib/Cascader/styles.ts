// @unocss-include
import { twMerge } from "tailwind-merge";

/**
 * Cascader styles — antd6 spec. The selector reuses Select's frame family;
 * the dropdown is the multi-column menu (antd renders N side-by-side
 * columns of 32px rows, each column 160px+ wide) with an optional search
 * input at the top of the panel.
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
);

export const cascaderSelectorClass = (variants: VariantProps<typeof selectorVariants>) =>
  twMerge(selectorVariants(variants));

/** The inline search input (mirrors Select's). */
export const cascaderSearchInputClass = () =>
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

/** Placeholder / value display. */
export const cascaderItemClass = cva(
  ["block", "truncate", "flex-1", "min-w-0", "text-start", "select-none"],
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

export const cascaderItemWrapClass = (variants: VariantProps<typeof cascaderItemClass>) =>
  twMerge(cascaderItemClass(variants));

/** Suffix area: clear × + the chevron (arrow points right when open). */
export const cascaderSuffixClass = cva(
  ["flex", "items-center", "shrink-0", "gap-[4px]", "ml-[4px]", "text-on-surface/45", "transition-upthrust-fast"],
  {
    variants: {
      size: {
        small: ["text-[10px]"],
        middle: ["text-[12px]"],
        large: ["text-[14px]"],
      },
    },
    defaultVariants: { size: "middle" },
  },
);

export const cascaderSuffixWrapClass = (variants: VariantProps<typeof cascaderSuffixClass>) =>
  twMerge(cascaderSuffixClass(variants));

export const cascaderArrowClass = cva(
  ["transition-transform", "duration-200", "ease-upthrust", "flex", "items-center", "cursor-pointer"],
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

export const cascaderArrowWrapClass = (variants: VariantProps<typeof cascaderArrowClass>) =>
  twMerge(cascaderArrowClass(variants));

export const cascaderClearClass = cva(
  [
    "flex", "items-center", "justify-center", "cursor-pointer",
    "text-on-surface/25", "hover:text-on-surface/45", "active:text-on-surface",
    "transition-upthrust-fast",
  ],
  {
    variants: {
      visible: { true: [], false: ["invisible", "pointer-events-none"] },
    },
    defaultVariants: { visible: false },
  },
);

export const cascaderClearWrapClass = (variants: VariantProps<typeof cascaderClearClass>) =>
  twMerge(cascaderClearClass(variants));

// ---------------------------------------------------------------------------
// Multiple-mode tags (same chip family as Select)
// ---------------------------------------------------------------------------

export const cascaderTagClass = cva(
  [
    "inline-flex", "items-center", "gap-[4px]", "h-[20px]", "px-[8px]",
    "rounded-sm", "bg-on-surface/6", "text-[12px]", "leading-none",
    "text-on-surface", "max-w-full", "mr-[4px]", "mt-[1px]", "mb-[1px]",
  ],
  {
    variants: {
      disabled: { true: ["!text-on-surface/25", "cursor-not-allowed"], false: [] },
    },
    defaultVariants: { disabled: false },
  },
);

export const cascaderTagWrapClass = (variants: VariantProps<typeof cascaderTagClass>) =>
  twMerge(cascaderTagClass(variants));

export const cascaderTagCloseClass = cva(
  [
    "flex", "items-center", "justify-center", "text-[10px]", "text-on-surface/45",
    "cursor-pointer", "rounded-full", "transition-upthrust-fast",
    "hover:text-on-surface", "hover:bg-on-surface/15",
  ],
  {
    variants: {
      disabled: { true: ["invisible", "pointer-events-none"], false: [] },
    },
    defaultVariants: { disabled: false },
  },
);

export const cascaderTagCloseWrapClass = (variants: VariantProps<typeof cascaderTagCloseClass>) =>
  twMerge(cascaderTagCloseClass(variants));

export const cascaderTagRestClass = () =>
  twMerge([
    "inline-flex", "items-center", "h-[20px]", "px-[8px]", "rounded-sm",
    "bg-on-surface/6", "text-[12px]", "leading-none", "text-on-surface-variant",
    "mr-[4px]", "mt-[1px]", "mb-[1px]", "select-none",
  ]);

// ---------------------------------------------------------------------------
// Dropdown — the multi-column menu
// ---------------------------------------------------------------------------

/** The floating panel: columns strip horizontally. */
export const cascaderDropdownClass = cva(
  [
    "bg-surface", "rounded-lg", "shadow", "p-[4px]",
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

export const cascaderDropdownWrapClass = (variants: VariantProps<typeof cascaderDropdownClass>) =>
  twMerge(cascaderDropdownClass(variants));

/** The columns strip: horizontal flex, each column scrolls independently. */
export const cascaderColumnsClass = () =>
  twMerge(["flex", "overflow-x-auto", "max-h-[264px]"]);

/** One menu column. */
export const cascaderColumnClass = () =>
  twMerge([
    "min-w-[140px]",
    "max-h-[264px]",
    "overflow-y-auto",
    "py-[4px]",
    "border-r",
    "border-solid",
    "border-outline-variant",
    "last:border-r-0",
    "shrink-0",
  ]);

/** One menu row. */
export const cascaderOptionClass = cva(
  [
    "flex", "items-center", "justify-between", "gap-[8px]",
    "px-[12px]", "py-[5px]", "text-[14px]", "h-[32px]",
    "cursor-pointer", "transition-upthrust-fast", "text-on-surface",
    "outline-none", "whitespace-nowrap",
  ],
  {
    variants: {
      selected: { true: ["!text-primary", "font-medium"], false: [] },
      active: { true: ["bg-on-surface/6"], false: ["hover:bg-on-surface/6"] },
      disabled: {
        true: ["!text-on-surface/25", "cursor-not-allowed", "pointer-events-none", "hover:bg-transparent"],
        false: [],
      },
    },
    defaultVariants: { selected: false, active: false, disabled: false },
  },
);

export const cascaderOptionWrapClass = (variants: VariantProps<typeof cascaderOptionClass>) =>
  twMerge(cascaderOptionClass(variants));

/** The expand chevron on rows with children. */
export const cascaderOptionExpandClass = cva(
  ["flex", "items-center", "text-[12px]", "text-on-surface/45", "shrink-0"],
  {
    variants: {
      active: { true: ["!text-primary"], false: [] },
    },
    defaultVariants: { active: false },
  },
);

export const cascaderOptionExpandWrapClass = (variants: VariantProps<typeof cascaderOptionExpandClass>) =>
  twMerge(cascaderOptionExpandClass(variants));

/** The check box in checkable mode (visual box + derived state). */
export const cascaderCheckboxClass = cva(
  [
    "flex", "items-center", "justify-center", "shrink-0",
    "h-[14px]", "w-[14px]", "rounded-sm", "border", "border-solid",
    "border-outline", "transition-upthrust-fast", "mr-[8px]",
  ],
  {
    variants: {
      state: {
        checked: ["!bg-primary", "!border-primary"],
        indeterminate: ["!bg-surface", "!border-primary"],
        unchecked: [],
      },
    },
    defaultVariants: { state: "unchecked" },
  },
);

export const cascaderCheckboxWrapClass = (variants: VariantProps<typeof cascaderCheckboxClass>) =>
  twMerge(cascaderCheckboxClass(variants));

/** The check mark / dash inside the box. */
export const cascaderCheckboxMarkClass = cva(
  ["text-[10px]", "leading-none", "pointer-events-none"],
  {
    variants: {
      state: {
        checked: ["text-white", "opacity-100", "scale-100"],
        indeterminate: ["text-primary", "opacity-100", "scale-100"],
        unchecked: ["opacity-0", "scale-0"],
      },
    },
    defaultVariants: { state: "unchecked" },
  },
);

export const cascaderCheckboxMarkWrapClass = (variants: VariantProps<typeof cascaderCheckboxMarkClass>) =>
  twMerge(cascaderCheckboxMarkClass(variants));

/** The search input row at the top of the panel (antd renders it inside). */
export const cascaderPanelSearchClass = () =>
  twMerge([
    "flex", "items-center", "px-[8px]", "py-[4px]", "mb-[4px]",
    "border-b", "border-solid", "border-outline-variant",
  ]);

export const cascaderPanelSearchInputClass = () =>
  twMerge([
    "flex-1", "min-w-0", "h-[28px]", "bg-transparent", "outline-none",
    "border-none", "p-0", "text-[14px]", "text-on-surface",
    "placeholder:text-on-surface/25", "[color-scheme:light]",
  ]);

/** The flat search result rows (path joined with ' / '). */
export const cascaderSearchItemClass = cva(
  [
    "flex", "items-center", "px-[12px]", "py-[5px]", "text-[14px]",
    "cursor-pointer", "transition-upthrust-fast", "text-on-surface",
    "whitespace-nowrap",
  ],
  {
    variants: {
      selected: { true: ["!text-primary", "font-medium"], false: [] },
      active: { true: ["bg-on-surface/6"], false: ["hover:bg-on-surface/6"] },
    },
    defaultVariants: { selected: false, active: false },
  },
);

export const cascaderSearchItemWrapClass = (variants: VariantProps<typeof cascaderSearchItemClass>) =>
  twMerge(cascaderSearchItemClass(variants));

/** Empty / no-match block. */
export const cascaderEmptyClass = () =>
  twMerge([
    "flex", "items-center", "justify-center",
    "py-[12px]", "px-[12px]", "text-[14px]", "text-on-surface/25",
    "select-none", "min-w-[140px]",
  ]);
