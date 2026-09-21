// @unocss-include
import { twMerge } from "tailwind-merge";

/**
 * InputNumber styles — antd6 spec:
 *  - frame: inline-flex, w-[90px] (controlWidth), rounded, border-outline,
 *    focus ring identical to Input
 *  - the input itself is borderless (the frame owns the border), text-align
 *    start, native spin buttons hidden
 *  - actions column: handleWidth 22px (controlHeightSM - 2), up/down
 *    chevrons stacked, separator border between them; hover/focus-within
 *    widens the column (antd handleWidth reveal)
 *  - prefix/suffix: flex none, 4px gap (inputAffixPadding)
 *  - sizes: h-control family + font 14/16/12 (antd inputFontSize)
 */
import { cva } from "class-variance-authority";

const inputNumberVariants = cva(
  [
    "inline-flex",
    "w-[90px]",
    "min-w-0",
    "items-stretch",
    "bg-surface",
    "rounded",
    "border",
    "border-solid",
    "border-outline",
    "transition-upthrust",
    "hover:border-primary",
    "focus-within:border-primary",
    "focus-within:ring-2",
    "focus-within:ring-primary/10",
  ],
  {
    variants: {
      size: {
        small: ["h-control-sm", "text-[12px]", "rounded-sm"],
        middle: ["h-control", "text-[14px]"],
        large: ["h-control-lg", "text-[16px]"],
      },
      status: {
        default: [],
        error: [
          "!border-error", "hover:!border-error",
          "focus-within:!border-error", "focus-within:!ring-error/8",
        ],
        warning: [
          "!border-[#faad14]", "hover:!border-[#faad14]",
          "focus-within:!border-[#faad14]", "focus-within:!ring-[#faad14]/10",
        ],
      },
      disabled: {
        true: [
          "!bg-on-surface/4", "!border-on-surface/15",
          "cursor-not-allowed",
          "hover:!border-on-surface/15",
          "focus-within:!ring-transparent",
        ],
        false: [],
      },
      readonly: {
        true: ["!bg-surface-variant", "!border-transparent", "hover:!border-transparent"],
        false: [],
      },
      focused: {
        // antd focused outline lives on the frame; UnoCSS :focus-within on
        // the wrapper covers it (kept for explicit control if needed).
        true: [],
        false: [],
      },
    },
    defaultVariants: {
      size: "middle",
      status: "default",
      disabled: false,
      readonly: false,
      focused: false,
    },
  },
);

export const inputNumberClass = (variants: Parameters<typeof inputNumberVariants>[0]) =>
  twMerge(inputNumberVariants(variants));

/** The inner text input — borderless, native spinners hidden. */
export const inputNumberInputClass = cva(
  [
    "relative",
    "w-full",
    "min-w-0",
    "bg-transparent",
    "outline-none",
    "border-none",
    "p-0",
    "text-on-surface",
    "placeholder:text-on-surface/25",
    "text-start",
    "tabular-nums",
    "[appearance:textfield]",
    "[&::-webkit-inner-spin-button]:appearance-none",
    "[&::-webkit-outer-spin-button]:appearance-none",
    "outline-hidden",
  ],
  {
    variants: {
      size: {
        small: ["px-[7px]"],
        middle: ["px-[11px]"],
        large: ["px-[11px]"],
      },
      outOfRange: {
        true: ["text-error"],
        false: [],
      },
      disabled: {
        true: ["cursor-not-allowed", "!text-on-surface/25"],
        false: [],
      },
    },
    defaultVariants: { size: "middle", outOfRange: false, disabled: false },
  },
);

export const inputNumberInputWrapClass = (variants: Parameters<typeof inputNumberInputClass>[0]) =>
  twMerge(inputNumberInputClass(variants));

/** prefix/suffix slot — flex none, self-center, 4px gap. */
export const inputNumberAffixClass = cva(
  [
    "flex",
    "items-center",
    "self-center",
    "shrink-0",
    "pointer-events-none",
    "text-on-surface-variant",
  ],
  {
    variants: {
      side: { prefix: ["ps-[11px]", "pe-[4px]"], suffix: ["ps-[4px]", "pe-[4px]"] },
      size: {
        small: ["text-[12px]"],
        middle: ["text-[14px]"],
        large: ["text-[16px]"],
      },
    },
    defaultVariants: { side: "prefix", size: "middle" },
  },
);

export const inputNumberAffixWrapClass = (variants: Parameters<typeof inputNumberAffixClass>[0]) =>
  twMerge(inputNumberAffixClass(variants));

/**
 * Up/down actions column — handleWidth 22px (antd: controlHeightSM - 2×lineWidth).
 * Two modes (antd): "input" (the embedded column, revealed on hover/focus,
 * chevrons stacked, separator border between them) and "spinner" (always
 * visible, buttons on both sides). We ship the embedded "input" mode.
 */
export const inputNumberActionsClass = cva(
  [
    "flex",
    "flex-col",
    "items-stretch",
    "my-[2px]",
    "shrink-0",
    "w-[22px]",
    "opacity-0",
    "transition-upthrust",
    "border-s",
    "border-solid",
    "border-outline",
    "bg-surface",
    "group-hover/inputnum:opacity-100",
    "group-focus-within/inputnum:opacity-100",
  ],
  {
    variants: {
      hidden: {
        // disabled/readonly hide the column entirely (antd)
        true: ["hidden"],
        false: [],
      },
    },
    defaultVariants: { hidden: false },
  },
);

export const inputNumberActionsWrapClass = (variants: Parameters<typeof inputNumberActionsClass>[0]) =>
  twMerge(inputNumberActionsClass(variants));

/** A single up/down action button — colorIcon, hover colorPrimary, active bg. */
export const inputNumberActionClass = cva(
  [
    "flex",
    "flex-1",
    "p-0",
    "border-0",
    "bg-transparent",
    "font-inherit",
    "items-center",
    "justify-center",
    "select-none",
    "leading-none",
    "text-center",
    "cursor-pointer",
    "text-on-surface/45",
    "transition-upthrust-fast",
    "hover:text-primary",
    "active:bg-on-surface/6",
  ],
  {
    variants: {
      direction: {
        up: [],
        down: ["border-t", "border-solid", "border-outline"],
      },
      disabled: {
        true: ["cursor-not-allowed", "text-on-surface/25", "hover:text-on-surface/25"],
        false: [],
      },
    },
    defaultVariants: { direction: "up", disabled: false },
  },
);

export const inputNumberActionWrapClass = (variants: Parameters<typeof inputNumberActionClass>[0]) =>
  twMerge(inputNumberActionClass(variants));
