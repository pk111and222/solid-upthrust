// @unocss-include
import { twMerge } from "tailwind-merge";

/**
 * Switch styles — antd6 token derivation (fontSize 14 × lineHeight 1.5714
 * ≈ 22 track height; handleSize = track - 2×2 padding = 16):
 *  - track: min-w-[44px] h-[22px] rounded-full, colorTextQuaternary
 *    (unchecked) → colorPrimary (checked), hover shades
 *  - handle: 16×16 white circle, absolute, slides via inset-inline-start
 *    (checked: calc(100% - 16px - 2px)), antd's active inset squeeze
 *  - inner (checkedChildren/unCheckedChildren): the rc-switch margin trick
 *    collapses to a simple conditional translate here — Solid re-renders
 *    the two spans and CSS handles the slide
 *  - small: track h-[16px] handle 12px (antd heightSM = controlHeight/2
 *    = 16, handleSizeSM = 12)
 *  - loading: opacity + a spinning icon in the handle
 */
import { cva } from "class-variance-authority";

const switchVariants = cva(
  [
    "relative",
    "inline-block",
    "box-border",
    "rounded-full",
    "cursor-pointer",
    "select-none",
    "align-middle",
    "bg-on-surface/25",
    "transition-upthrust",
    "hover:bg-on-surface/45",
    "focus-visible:outline-hidden",
    "focus-visible:ring-2",
    "focus-visible:ring-primary",
  ],
  {
    variants: {
      checked: {
        true: ["bg-primary", "hover:bg-primary/85"],
        false: [],
      },
      size: {
        // middle (default): track 22px
        middle: ["h-[22px]", "min-w-[44px]", "leading-[22px]"],
        // small: track 16px (antd heightSM)
        small: ["h-[16px]", "min-w-[28px]", "leading-[16px]"],
      },
      disabled: {
        true: ["cursor-not-allowed", "opacity-50", "hover:bg-on-surface/25"],
        false: [],
      },
      loading: {
        true: ["cursor-not-allowed", "opacity-50"],
        false: [],
      },
    },
    compoundVariants: [
      { checked: true, disabled: true, class: "hover:bg-primary" },
      { checked: true, loading: true, class: "hover:bg-primary" },
      { checked: false, loading: true, class: "hover:bg-on-surface/25" },
    ],
    defaultVariants: { checked: false, size: "middle", disabled: false, loading: false },
  },
);

export const switchClass = (variants: Parameters<typeof switchVariants>[0]) =>
  twMerge(switchVariants(variants));

/**
 * The handle knob. Position: absolute; the left offset is set inline per
 * checked state (antd: trackPadding 2px ↔ calc(100% - handleSize - 2px))
 * because the two sizes differ — a checked switch is a different element
 * position, not a variant swap.
 */
const switchHandleVariants = cva(
  [
    "absolute",
    "top-1/2",
    "-translate-y-1/2",
    "rounded-full",
    "bg-white",
    "shadow-[0_2px_4px_0_rgba(0,35,11,0.2)]",
    "transition-upthrust",
    "flex",
    "items-center",
    "justify-center",
    "pointer-events-none",
  ],
  {
    variants: {
      size: {
        middle: ["h-[16px]", "w-[16px]"],
        small: ["h-[12px]", "w-[12px]"],
      },
    },
    defaultVariants: { size: "middle" },
  },
);

export const switchHandleClass = (variants: Parameters<typeof switchHandleVariants>[0]) =>
  twMerge(switchHandleVariants(variants));

/**
 * Inner content (checkedChildren/unCheckedChildren). rc-switch uses a
 * margin-collapsing trick so both spans exist and slide; here the two
 * spans sit in a flex row and the container clips — the visual read is
 * identical (one child visible at a time, sliding with the handle).
 */
const switchInnerVariants = cva(
  [
    "block",
    "overflow-hidden",
    "h-full",
    "rounded-full",
    "text-white",
    "text-[12px]",
    "transition-upthrust",
    "flex",
    "items-center",
    "pointer-events-none",
  ],
  {
    variants: {
      size: {
        middle: ["px-[8px]"],
        small: ["px-[6px]", "text-[10px]"],
      },
      checked: {
        // antd inner padding: checked leaves room for the handle on the
        // right, unchecked mirrors the padding on the left.
        true: ["ps-[8px]", "pe-[22px]", "justify-start"],
        false: ["ps-[22px]", "pe-[8px]", "justify-end"],
      },
    },
    compoundVariants: [
      { size: "small", checked: true, class: "ps-[6px] pe-[18px]" },
      { size: "small", checked: false, class: "ps-[18px] pe-[6px]" },
    ],
    defaultVariants: { size: "middle", checked: false },
  },
);

export const switchInnerClass = (variants: Parameters<typeof switchInnerVariants>[0]) =>
  twMerge(switchInnerVariants(variants));
