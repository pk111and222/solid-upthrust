// @unocss-include
import { twMerge } from "tailwind-merge";

/**
 * Checkbox styles — antd6 spec (checkboxSize = controlInteractiveSize =
 * controlHeight/2 = 16px):
 *  - wrapper: inline-flex items-center cursor-pointer
 *  - box: 16×16, rounded-sm, border outline; checked → bg/border primary
 *    with a white checkmark (::after rotated border trick → here an icon
 *    span); indeterminate → primary dash on container bg
 *  - hover: border-primary (unchecked) / bg primary-hover (checked)
 *  - input: absolutely positioned, opacity-0, still focusable — the
 *    :focus-visible ring lands on the box via a sibling selector
 *  - label text: 8px inline padding each side (paddingXS)
 */
import { cva } from "class-variance-authority";

const checkboxWrapperVariants = cva(
  [
    "inline-flex",
    "items-center",
    "cursor-pointer",
    "align-baseline",
    "relative",
  ],
  {
    variants: {
      disabled: {
        true: ["cursor-not-allowed"],
        false: [],
      },
    },
    defaultVariants: { disabled: false },
  },
);

export const checkboxWrapperClass = (variants: Parameters<typeof checkboxWrapperVariants>[0]) =>
  twMerge(checkboxWrapperVariants(variants));

const checkboxBoxVariants = cva(
  [
    "relative",
    "block",
    "shrink-0",
    "box-border",
    "whitespace-nowrap",
    "leading-none",
    "cursor-pointer",
    "bg-surface",
    "border",
    "border-solid",
    "border-outline",
    "rounded-sm",
    "transition-upthrust-slow",
    "flex",
    "items-center",
    "justify-center",
    "peer-focus-visible:ring-2",
    "peer-focus-visible:ring-primary",
  ],
  {
    variants: {
      checked: {
        true: ["!bg-primary", "!border-primary"],
        false: ["peer-hover:border-primary"],
      },
      indeterminate: {
        true: ["!bg-surface"],
        false: [],
      },
      size: {
        middle: ["h-[16px]", "w-[16px]"],
        // antd has no checkbox sizes; small shrinks for dense rows
        small: ["h-[14px]", "w-[14px]"],
      },
      disabled: {
        true: [
          "cursor-not-allowed",
          "!bg-on-surface/4",
          "!border-outline",
          "pointer-events-none",
        ],
        false: [],
      },
      // Hover on a CHECKED box fills primary-hover (antd)
      checkedHover: {
        true: ["peer-hover:!bg-primary/85", "peer-hover:!border-primary/85"],
        false: [],
      },
    },
    defaultVariants: { checked: false, size: "middle", disabled: false, indeterminate: false, checkedHover: false },
  },
);

export const checkboxBoxClass = (variants: Parameters<typeof checkboxBoxVariants>[0]) =>
  twMerge(checkboxBoxVariants(variants));

/** The checkmark — white, rotated 45°, scale-in (antd ::after). */
export const checkboxCheckClass = cva(
  [
    "block",
    "text-white",
    "leading-none",
    "pointer-events-none",
    "transition-upthrust-fast",
    "i-mdi-check",
  ],
  {
    variants: {
      disabled: { true: ["!text-on-surface/25"], false: [] },
      size: {
        middle: ["text-[10px]"],
        small: ["text-[9px]"],
      },
      visible: {
        true: ["scale-100", "opacity-100"],
        false: ["scale-0", "opacity-0"],
      },
    },
    defaultVariants: { size: "middle", visible: false },
  },
);

export const checkboxCheckWrapClass = (variants: Parameters<typeof checkboxCheckClass>[0]) =>
  twMerge(checkboxCheckClass(variants));

/** The indeterminate dash — primary, centered (antd ::after 8×8 block). */
export const checkboxDashClass = cva(
  [
    "block",
    "bg-primary",
    "rounded-[1px]",
    "pointer-events-none",
  ],
  {
    variants: {
      size: {
        middle: ["h-[8px]", "w-[8px]"],
        small: ["h-[7px]", "w-[7px]"],
      },
      visible: {
        true: ["scale-100", "opacity-100"],
        false: ["scale-0", "opacity-0"],
      },
      disabled: {
        true: ["!bg-on-surface/25"],
        false: [],
      },
    },
    defaultVariants: { size: "middle", visible: false, disabled: false },
  },
);

export const checkboxDashWrapClass = (variants: Parameters<typeof checkboxDashClass>[0]) =>
  twMerge(checkboxDashClass(variants));

/** The hidden native input — opacity-0 but focusable/clickable. */
export const checkboxInputClass = () =>
  twMerge([
    "absolute",
    "inset-0",
    "w-full",
    "h-full",
    "disabled:cursor-not-allowed",
    "z-[1]",
    "cursor-pointer",
    "opacity-0",
    "m-0",
    "peer",
  ]);

/** Label text — paddingXS both sides (antd `& + span`). */
export const checkboxLabelClass = cva(
  [
    "pl-xs",
    "pr-xs",
    "text-[14px]",
    "leading-[1.5714]",
    "text-on-surface",
    "cursor-pointer",
    "select-none",
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

export const checkboxLabelWrapClass = (variants: Parameters<typeof checkboxLabelClass>[0]) =>
  twMerge(checkboxLabelClass(variants));

/** Group container — inline-flex wrap, columnGap marginXS (8px). */
export const checkboxGroupClass = (class_?: string) =>
  twMerge(['inline-flex', 'flex-wrap', 'gap-x-xs', 'gap-y-xs'], class_)
