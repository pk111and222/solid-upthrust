// @unocss-include
import { twMerge } from "tailwind-merge";

/**
 * DatePicker styles — antd6 spec:
 *  - the input reuses the Input frame family (calendar icon suffix)
 *  - the panel is the Dropdown overlay family: fixed 280px-ish calendar —
 *    header (month/year label + prev/next/super-prev/super-next), weekday
 *    row, 6×7 day grid (28px cells), and the month/year list variants;
 *    a footer bar with "今天" (today button)
 */
import { cva, type VariantProps } from "class-variance-authority";

/** The floating calendar panel. */
export const datePickerDropdownClass = (variants: { visible?: boolean; placement?: string }) =>
  twMerge([
    "bg-surface", "rounded-lg", "shadow", "p-[8px]",
    "transition-opacity", "duration-fast", "ease-upthrust", "origin-top",
    "outline-none",
    variants.visible ? "opacity-100" : "opacity-0 pointer-events-none",
  ])

/** Panel header bar. */
export const datePickerHeaderClass = () =>
  twMerge([
    "flex", "items-center", "justify-between", "mb-[8px]", "px-[4px]",
  ]);

/** The year/month label buttons (drill into month/year mode). */
export const datePickerHeaderLabelClass = () =>
  twMerge([
    "flex", "items-center", "gap-[4px]",
    "cursor-pointer", "select-none",
    "text-[14px]", "font-medium", "text-on-surface",
    "hover:text-primary", "transition-upthrust-fast",
    "px-[6px]", "py-[2px]", "rounded",
  ]);

/** Prev/next arrow buttons. */
export const datePickerHeaderNavClass = cva(
  [
    "flex", "items-center", "justify-center",
    "h-[24px]", "w-[24px]",
    "rounded", "cursor-pointer", "select-none",
    "text-on-surface/45", "transition-upthrust-fast",
    "hover:text-on-surface", "hover:bg-on-surface/6",
  ],
  {
    variants: {
      disabled: { true: ["opacity-30", "pointer-events-none"], false: [] },
    },
    defaultVariants: { disabled: false },
  },
);

export const datePickerHeaderNavWrapClass = (variants: VariantProps<typeof datePickerHeaderNavClass>) =>
  twMerge(datePickerHeaderNavClass(variants));

/** The weekday header row. */
export const datePickerWeekHeaderClass = () =>
  twMerge(["grid", "grid-cols-7", "mb-[4px]"]);

export const datePickerWeekHeaderCellClass = () =>
  twMerge([
    "flex", "items-center", "justify-center",
    "h-[28px]", "text-[12px]", "text-on-surface/45", "select-none",
  ]);

/** The 6×7 day grid. */
export const datePickerGridClass = () =>
  twMerge(["grid", "grid-cols-7"]);

const datePickerCellVariants = cva(
  [
    "flex", "items-center", "justify-center",
    "h-[28px]", "w-[28px]", "mx-auto",
    "text-[14px]", "rounded",
    "cursor-pointer", "transition-upthrust-fast",
  ],
  {
    variants: {
      selected: { true: ["!bg-primary", "!text-on-primary", "font-medium"], false: [] },
      today: { true: ["!text-primary", "font-medium"], false: [] },
      adjacent: { true: ["text-on-surface/25"], false: ["text-on-surface"] },
      active: { true: ["bg-on-surface/6"], false: [] },
      disabled: {
        true: ["!text-on-surface/25", "cursor-not-allowed", "pointer-events-none", "hover:bg-transparent"],
        false: ["hover:bg-on-surface/6"],
      },
    },
    defaultVariants: { selected: false, today: false, adjacent: false, active: false, disabled: false },
  },
);

export const datePickerCellWrapClass = (variants: VariantProps<typeof datePickerCellVariants>) =>
  twMerge(datePickerCellVariants(variants));

/** The month/year list grids (12 cells: 4 rows × 3 cols). */
export const datePickerListClass = () =>
  twMerge(["grid", "grid-cols-3", "gap-y-[8px]", "w-[252px]"]);

const datePickerMonthCellVariants = cva(
  [
    "flex", "items-center", "justify-center",
    "h-[56px]", "w-[64px]", "mx-auto",
    "text-[14px]", "rounded",
    "cursor-pointer", "transition-upthrust-fast",
  ],
  {
    variants: {
      selected: { true: ["!bg-primary", "!text-on-primary", "font-medium"], false: [] },
      active: { true: ["bg-on-surface/6"], false: [] },
      disabled: {
        true: ["!text-on-surface/25", "cursor-not-allowed", "pointer-events-none", "hover:bg-transparent"],
        false: ["hover:bg-on-surface/6"],
      },
    },
    defaultVariants: { selected: false, active: false, disabled: false },
  },
);

export const datePickerMonthCellWrapClass = (variants: VariantProps<typeof datePickerMonthCellVariants>) =>
  twMerge(datePickerMonthCellVariants(variants));

/** Footer bar (今天 button). */
export const datePickerFooterClass = () =>
  twMerge([
    "flex", "items-center", "justify-end",
    "mt-[8px]", "pt-[8px]", "border-t", "border-solid", "border-outline-variant",
  ]);

export const datePickerTodayBtnClass = cva(
  [
    "px-[8px]", "py-[2px]", "text-[12px]", "rounded",
    "cursor-pointer", "select-none",
    "text-primary", "transition-upthrust-fast",
    "hover:bg-primary/8",
  ],
  { variants: {}, defaultVariants: {} },
);

export const datePickerTodayBtnWrapClass = () => twMerge(datePickerTodayBtnClass({}));

/** The input suffix (calendar icon + clear ×). */
export const datePickerSuffixClass = () =>
  twMerge(["flex", "items-center", "shrink-0", "gap-[4px]", "ml-[4px]", "text-on-surface/45"]);

export const datePickerClearClass = cva(
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

export const datePickerClearWrapClass = (variants: VariantProps<typeof datePickerClearClass>) =>
  twMerge(datePickerClearClass(variants));
