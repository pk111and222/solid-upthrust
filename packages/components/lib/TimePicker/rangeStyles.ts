// @unocss-include
import { twMerge } from "tailwind-merge";

/**
 * TimeRangePicker styles — antd6 spec:
 *  - two segmented inputs in one control frame joined by "~", clock icon
 *    suffix + clear × on the shared frame
 *  - the panel is TWO column groups side by side (start | end), each group
 *    the standard TimePicker 2-3 column strip; a divider between the groups
 */
import { cva, type VariantProps } from "class-variance-authority";

const timeRangePickerDropdownVariants = cva(
  [
    "bg-surface", "rounded-lg", "shadow", "p-[4px]",
    "transition-opacity", "duration-fast", "ease-upthrust",
    "outline-none",
  ],
  {
    variants: {
      visible: {
        true: ["opacity-100"],
        false: ["opacity-0", "pointer-events-none"],
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

export const timeRangePickerDropdownClass = (variants: VariantProps<typeof timeRangePickerDropdownVariants>) =>
  twMerge(timeRangePickerDropdownVariants(variants));

/** The two panel groups strip. */
export const timeRangePickerPanelsClass = () =>
  twMerge(["flex", "gap-[4px]"]);

/** One end's panel group (columns + the divider slot). */
export const timeRangePickerPanelClass = () =>
  twMerge(["shrink-0"]);

/** One end's columns strip (borderless variant of the TimePicker strip). */
export const timeRangePickerColumnsClass = () =>
  twMerge(["flex", "overflow-x-auto"]);

/** The input separator ("~"). */
export const timeRangePickerSeparatorClass = () =>
  twMerge([
    "flex", "items-center", "justify-center",
    "px-[4px]", "text-on-surface/25", "select-none", "shrink-0",
  ]);

/** The shared input suffix (clock icon + clear ×). */
export const timeRangePickerSuffixClass = () =>
  twMerge([
    "flex", "items-center", "shrink-0", "gap-[4px]",
    "ml-[4px]", "text-on-surface/45",
  ]);

/** The per-end input inside the shared frame. */
export const timeRangePickerInputClass = (variants: { size?: 'small' | 'middle' | 'large' }) =>
  twMerge([
    "flex-1", "min-w-0", "bg-transparent", "outline-none", "border-none", "p-0",
    "text-on-surface", "placeholder:text-on-surface/25", "tabular-nums", "cursor-text", "text-start",
    variants.size === 'small' ? 'text-[12px]' : '',
    variants.size === 'middle' ? 'text-[14px]' : '',
    variants.size === 'large' ? 'text-[16px]' : '',
  ]);
