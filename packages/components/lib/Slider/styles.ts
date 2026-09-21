// @unocss-include
import { twMerge } from "tailwind-merge";

/**
 * Slider styles — antd6 spec:
 *  - track: 4px tall (controlHeight / 8), marginY 12px total so a full
 *    control-height row centers it; default width 100%
 *  - rail: bg-on-surface/15 (the unselected groove)
 *  - selection (the filled part): bg-primary
 *  - thumb: 10px white circle with a primary border and shadow, scale-1.2
 *    + solid ring while dragging/hovering (antd handle: 10px, border 2px,
 *    shadow 0 3px 1px rgba(0,0,0,0.1))
 *  - marks: 4px dots on the rail + 10px labels below
 *  - vertical: swaps axes via writing-mode-independent flex-col sizing
 */
import { cva } from "class-variance-authority";

const sliderWrapperVariants = cva(
  [
    "relative",
    "w-full",
    "h-control",
    "flex",
    "items-center",
    "cursor-pointer",
    "touch-none",
    "select-none",
  ],
  {
    variants: {
      disabled: {
        true: ["cursor-not-allowed", "opacity-50", "pointer-events-none"],
        false: [],
      },
      vertical: {
        true: ["h-[200px]", "w-[4px]", "flex-col", "justify-center", "items-center"],
        false: [],
      },
    },
    defaultVariants: { disabled: false, vertical: false },
  },
);

export const sliderWrapperClass = (variants: Parameters<typeof sliderWrapperVariants>[0]) =>
  twMerge(sliderWrapperVariants(variants));

/** The groove — full-length background rail. Horizontal: centered on the
 *  wrapper's midline (the h-control row is taller than the 4px rail). */
export const sliderRailClass = cva(
  ["absolute", "rounded-full", "bg-on-surface/15"],
  {
    variants: {
      vertical: {
        true: ["w-full", "h-full"],
        false: ["h-[4px]", "w-full", "top-1/2", "-translate-y-1/2"],
      },
    },
    defaultVariants: { vertical: false },
  },
);

export const sliderRailWrapClass = (variants: Parameters<typeof sliderRailClass>[0]) =>
  twMerge(sliderRailClass(variants));

/** The filled selection between the two handles. Same midline centering. */
export const sliderTrackClass = cva(
  ["absolute", "rounded-full", "bg-primary"],
  {
    variants: {
      vertical: {
        true: ["w-full"],
        false: ["h-[4px]", "top-1/2", "-translate-y-1/2"],
      },
    },
    defaultVariants: { vertical: false },
  },
);

export const sliderTrackWrapClass = (variants: Parameters<typeof sliderTrackClass>[0]) =>
  twMerge(sliderTrackClass(variants));

/** The draggable thumb. */
export const sliderHandleClass = cva(
  [
    "absolute",
    "block",
    "rounded-full",
    "bg-white",
    "border-2",
    "border-solid",
    "border-primary",
    "shadow-[0_3px_1px_rgba(0,0,0,0.1)]",
    "cursor-grab",
    "transition-transform",
    "duration-100",
    "z-[1]",
    "hover:scale-[1.2]",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-primary",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface",
  ],
  {
    variants: {
      dragging: {
        true: ["scale-[1.2]", "cursor-grabbing"],
        false: [],
      },
      size: {
        middle: ["h-[10px]", "w-[10px]"],
      },
    },
    defaultVariants: { dragging: false, size: "middle" },
  },
);

export const sliderHandleWrapClass = (variants: Parameters<typeof sliderHandleClass>[0]) =>
  twMerge(sliderHandleClass(variants));

/** A mark dot on the rail. */
export const sliderMarkDotClass = cva(
  ["absolute", "w-[4px]", "h-[4px]", "rounded-full", "bg-surface", "border", "border-solid", "border-on-surface/25"],
  {
    variants: {
      passed: {
        // Marks under the selection paint primary (antd).
        true: ["!bg-primary", "!border-primary"],
        false: [],
      },
    },
    defaultVariants: { passed: false },
  },
);

export const sliderMarkDotWrapClass = (variants: Parameters<typeof sliderMarkDotClass>[0]) =>
  twMerge(sliderMarkDotClass(variants));

/** A mark label below the rail. */
export const sliderMarkLabelClass = cva(
  [
    "absolute",
    "text-[12px]",
    "leading-[1.5714]",
    "text-on-surface-variant",
    "whitespace-nowrap",
    "select-none",
  ],
  {
    variants: {
      passed: {
        true: ["!text-on-surface"],
        false: [],
      },
    },
    defaultVariants: { passed: false },
  },
);

export const sliderMarkLabelWrapClass = (variants: Parameters<typeof sliderMarkLabelClass>[0]) =>
  twMerge(sliderMarkLabelClass(variants));
