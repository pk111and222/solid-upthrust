// @unocss-include
import { twMerge } from "tailwind-merge";

/**
 * TimePicker styles — antd6 spec:
 *  - the input reuses the Input frame family (h-control, time icon suffix)
 *  - the panel is the Dropdown overlay family: 2-3 side-by-side columns of
 *    32px rows (24 hours / 60 minutes / 60 seconds), each column scrolls
 *    independently with the selected value centered/highlighted
 *  - the footer (optional "Now"/"OK" bar) is presentational
 */
import { cva, type VariantProps } from "class-variance-authority";

const timePickerDropdownVariants = cva(
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

export const timePickerDropdownClass = (variants: VariantProps<typeof timePickerDropdownVariants>) =>
  twMerge(timePickerDropdownVariants(variants));

/** The columns strip. */
export const timePickerColumnsClass = () =>
  twMerge(["flex", "overflow-x-auto"]);

/** One column. */
export const timePickerColumnClass = () =>
  twMerge([
    "min-w-[56px]",
    "h-[224px]", // 7 visible rows × 32px
    "overflow-y-auto",
    "py-[4px]",
    "border-r",
    "border-solid",
    "border-outline-variant",
    "last:border-r-0",
    "shrink-0",
  ]);

/** One option row. */
export const timePickerOptionClass = cva(
  [
    "flex", "items-center", "justify-center",
    "h-[32px]", "text-[14px]", "tabular-nums",
    "cursor-pointer", "transition-upthrust-fast", "text-on-surface",
  ],
  {
    variants: {
      selected: { true: ["!text-primary", "font-medium", "bg-primary/8"], false: [] },
      active: { true: ["bg-on-surface/6"], false: ["hover:bg-on-surface/6"] },
      disabled: {
        true: ["!text-on-surface/25", "cursor-not-allowed", "pointer-events-none", "hover:bg-transparent"],
        false: [],
      },
    },
    defaultVariants: { selected: false, active: false, disabled: false },
  },
);

export const timePickerOptionWrapClass = (variants: VariantProps<typeof timePickerOptionClass>) =>
  twMerge(timePickerOptionClass(variants));

/** The input suffix (clock icon + clear ×). */
export const timePickerSuffixClass = () =>
  twMerge([
    "flex", "items-center", "shrink-0", "gap-[4px]",
    "ml-[4px]", "text-on-surface/45",
  ]);

export const timePickerClearClass = cva(
  [
    "flex", "items-center", "justify-center", "cursor-pointer",
    "text-on-surface/25", "hover:text-on-surface/45", "active:text-on-surface",
    "transition-upthrust-fast", "text-[12px]",
  ],
  {
    variants: {
      visible: { true: [], false: ["invisible", "pointer-events-none"] },
    },
    defaultVariants: { visible: false },
  },
);

export const timePickerClearWrapClass = (variants: VariantProps<typeof timePickerClearClass>) =>
  twMerge(timePickerClearClass(variants));

/** The clock icon. */
export const timePickerIconClass = () =>
  twMerge(["text-[12px]", "flex", "items-center", "pointer-events-none"]);
