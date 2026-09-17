// @unocss-include
import { twMerge } from "tailwind-merge";

/**
 * Radio styles — antd6 spec (radioSize = controlInteractiveSize = 16px):
 *  - wrapper: inline-flex items-center cursor-pointer (same skeleton as
 *    Checkbox — they are visual siblings)
 *  - dot: 16×16 circle, border outline; checked → border-primary with a
 *    8×8 primary inner dot scale-in (antd ::after)
 *  - hover: border-primary (unchecked); checked keeps primary
 *  - input: absolutely positioned opacity-0 peer — :focus-visible ring and
 *    :checked land on the dot via peer classes
 *  - label text: paddingXS both sides
 *  - button variant (RadioButton): the solid/outlined joined group — each
 *    button squares the inner corners, the checked one paints primary
 */
import { cva } from "class-variance-authority";

const radioWrapperVariants = cva(
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

export const radioWrapperClass = (variants: Parameters<typeof radioWrapperVariants>[0]) =>
  twMerge(radioWrapperVariants(variants));

const radioDotVariants = cva(
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
    "rounded-full",
    "transition-upthrust-slow",
    "flex",
    "items-center",
    "justify-center",
    "peer-focus-visible:ring-2",
    "peer-focus-visible:ring-primary/10",
  ],
  {
    variants: {
      checked: {
        true: ["!border-primary"],
        false: ["hover:border-primary"],
      },
      size: {
        middle: ["h-[16px]", "w-[16px]"],
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
    },
    defaultVariants: { checked: false, size: "middle", disabled: false },
  },
);

export const radioDotClass = (variants: Parameters<typeof radioDotVariants>[0]) =>
  twMerge(radioDotVariants(variants));

/** The inner dot — primary, scale-in when checked (antd ::after 8×8). */
export const radioInnerDotClass = cva(
  [
    "block",
    "bg-primary",
    "rounded-full",
    "pointer-events-none",
    "transition-upthrust-fast",
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

export const radioInnerDotWrapClass = (variants: Parameters<typeof radioInnerDotClass>[0]) =>
  twMerge(radioInnerDotClass(variants));

/** The hidden native input — opacity-0 but focusable/clickable. */
export const radioInputClass = () =>
  twMerge([
    "absolute",
    "inset-[-1px]",
    "z-[1]",
    "cursor-pointer",
    "opacity-0",
    "m-0",
    "peer",
  ]);

/** Label text — paddingXS both sides (antd `& + span`). */
export const radioLabelClass = cva(
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

export const radioLabelWrapClass = (variants: Parameters<typeof radioLabelClass>[0]) =>
  twMerge(radioLabelClass(variants));

/** Group container — inline-flex wrap, columnGap marginXS (8px). */
export const radioGroupClass = (class_?: string) =>
  twMerge(['inline-flex', 'flex-wrap', 'gap-x-xs', 'gap-y-xs', 'items-center'], class_)

// ---------------------------------------------------------------------------
// Radio.Button — the joined segmented group (antd Radio.Group with
// optionType="button"). Each button is a bordered control; the checked one
// paints primary. Middle buttons square BOTH lateral corners; the first/last
// keep their outer radius. -ml-px collapses the shared border.
// ---------------------------------------------------------------------------

export const radioButtonVariants = cva(
  [
    "relative",
    "inline-flex",
    "items-center",
    "justify-center",
    "cursor-pointer",
    "select-none",
    "whitespace-nowrap",
    "border",
    "border-solid",
    "border-outline",
    "bg-surface",
    "text-on-surface",
    "transition-upthrust",
    "hover:text-primary",
    "peer-focus-visible:ring-2",
    "peer-focus-visible:ring-primary/10",
    "px-[15px]",
    "text-[14px]",
    "h-control",
    "-ml-px",
  ],
  {
    variants: {
      checked: {
        true: ["!bg-primary", "!border-primary", "!text-on-primary", "hover:!text-on-primary"],
        false: [],
      },
      position: {
        first: ["rounded-l", "!ml-0"],
        middle: [],
        last: ["rounded-r"],
      },
      disabled: {
        true: [
          "cursor-not-allowed",
          "!bg-on-surface/4",
          "!border-outline",
          "!text-on-surface/25",
          "pointer-events-none",
        ],
        false: [],
      },
    },
    defaultVariants: { checked: false, position: "middle", disabled: false },
  },
);

export const radioButtonClass = (variants: Parameters<typeof radioButtonVariants>[0]) =>
  twMerge(radioButtonVariants(variants));

/** The hidden input inside a button-style radio. */
export const radioButtonInputClass = () =>
  twMerge([
    "absolute",
    "inset-0",
    "z-[1]",
    "cursor-pointer",
    "opacity-0",
    "m-0",
    "peer",
  ]);

/** Button group container — inline-flex, no wrap (a segmented strip). */
export const radioButtonGroupClass = (class_?: string) =>
  twMerge(['inline-flex', 'items-center'], class_)
