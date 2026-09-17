// @unocss-include
import { twMerge } from "tailwind-merge";

/**
 * RangePicker styles — antd6 spec:
 *  - two inputs in one control frame, joined by a "~" separator, calendar
 *    icon suffix + clear × on the shared frame
 *  - the panel is a TWO-MONTH calendar: left panel + right panel (left+1
 *    month) side by side, each with its own header; day cells gain the
 *    range highlighting (in-range wash, endpoint pills, hover preview)
 */
import { cva, type VariantProps } from "class-variance-authority";

/** The floating two-month panel. */
const rangePickerDropdownVariants = cva(
  [
    "bg-surface", "rounded-lg", "shadow", "p-[8px]",
    "transition-overlay", "duration-fast", "ease-upthrust",
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

export const rangePickerDropdownClass = (variants: VariantProps<typeof rangePickerDropdownVariants>) =>
  twMerge(rangePickerDropdownVariants(variants))

/** The two panels strip. */
export const rangePickerPanelsClass = () =>
  twMerge(["flex", "gap-[8px]"]);

/** One month panel (reuses the DatePicker panel body styles). */
export const rangePickerPanelClass = () =>
  twMerge(["w-[252px]", "shrink-0"]);

/** The input separator ("~"). */
export const rangePickerSeparatorClass = () =>
  twMerge([
    "flex", "items-center", "justify-center",
    "px-[4px]", "text-on-surface/25", "select-none", "shrink-0",
  ]);

/**
 * Range day cells — endpoint pills keep the selected background with the
 * OUTER corner fully rounded (antd's capsule effect: the start pill rounds
 * its left corners, the end pill its right); in-range cells wash primary/8.
 */
const rangePickerCellVariants = cva(
  [
    "flex", "items-center", "justify-center",
    "h-[28px]", "w-[28px]", "mx-auto",
    "text-[14px]",
    "cursor-pointer", "transition-upthrust-fast",
  ],
  {
    variants: {
      selected: { true: ["!bg-primary", "!text-on-primary", "font-medium"], false: [] },
      today: { true: ["!text-primary", "font-medium"], false: [] },
      adjacent: { true: ["text-on-surface/25"], false: ["text-on-surface"] },
      active: { true: ["bg-on-surface/6"], false: [] },
      inRange: { true: ["bg-primary/8", "!text-primary"], false: [] },
      hoverInRange: { true: ["bg-primary/8"], false: [] },
      hoverEndpoint: { true: ["border", "border-solid", "border-primary", "!text-primary"], false: [] },
      'range-start': { true: ["rounded-r-none"], false: [] },
      'range-end': { true: ["rounded-l-none"], false: [] },
      disabled: {
        true: ["!text-on-surface/25", "cursor-not-allowed", "pointer-events-none", "hover:bg-transparent"],
        false: ["hover:bg-on-surface/6"],
      },
    },
    defaultVariants: {
      selected: false, today: false, adjacent: false, active: false,
      inRange: false, hoverInRange: false, hoverEndpoint: false,
      'range-start': false, 'range-end': false, disabled: false,
    },
  },
);

export const rangePickerCellWrapClass = (variants: VariantProps<typeof rangePickerCellVariants>) =>
  twMerge(rangePickerCellVariants(variants));

/** The input suffix (calendar icon + clear ×) — shared frame, one icon. */
export const rangePickerSuffixClass = () =>
  twMerge(["flex", "items-center", "shrink-0", "gap-[4px]", "ml-[4px]", "text-on-surface/45"]);

export const rangePickerClearClass = cva(
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

export const rangePickerClearWrapClass = (variants: VariantProps<typeof rangePickerClearClass>) =>
  twMerge(rangePickerClearClass(variants));

/** The per-end input inside the shared frame. */
export const rangePickerInputClass = (variants: { size?: 'small' | 'middle' | 'large' }) =>
  twMerge([
    "flex-1", "min-w-0", "bg-transparent", "outline-none", "border-none", "p-0",
    "text-on-surface", "placeholder:text-on-surface/25", "cursor-text", "text-center",
    variants.size === 'small' ? 'text-[12px]' : '',
    variants.size === 'middle' ? 'text-[14px]' : '',
    variants.size === 'large' ? 'text-[16px]' : '',
  ]);
