// @unocss-include
import { twMerge } from "tailwind-merge";

/**
 * Rate styles — antd6 spec:
 *  - wrapper: inline-flex, gap 8px (marginXS) between characters
 *  - character: 20px (rateStarSize) icon; unselected colorTextTertiary
 *    (on-surface/45), selected colorPrimary
 *  - half support: the icon is two stacked copies clipped 50%/50% — the
 *    base renders unselected, the overlay (clipped to the hovered half
 *    width) renders selected
 *  - hover scale: 1.15 while the pointer is over a character (antd)
 *  - disabled: on-surface/25, no pointer events
 */
import { cva } from "class-variance-authority";

const rateWrapperVariants = cva(
  [
    "inline-flex",
    "items-center",
    "gap-x-xs",
    "leading-none",
  ],
  {
    variants: {
      disabled: {
        true: ["cursor-not-allowed", "opacity-60"],
        false: ["cursor-pointer"],
      },
    },
    defaultVariants: { disabled: false },
  },
);

export const rateWrapperClass = (variants: Parameters<typeof rateWrapperVariants>[0]) =>
  twMerge(rateWrapperVariants(variants));

/**
 * One character cell. The cell is relative; the base icon sits full-size,
 * and a half-width overlay (selected-colored) clips on top when the value
 * lands on a half.
 */
export const rateCharacterClass = cva(
  [
    "relative",
    "inline-block",
    "w-[20px]",
    "h-[20px]",
    "cursor-pointer",
    "transition-transform",
    "duration-100",
    "hover:scale-[1.15]",
  ],
  {
    variants: {
      disabled: {
        true: ["cursor-not-allowed", "hover:scale-100"],
        false: [],
      },
    },
    defaultVariants: { disabled: false },
  },
);

export const rateCharacterWrapClass = (variants: Parameters<typeof rateCharacterClass>[0]) =>
  twMerge(rateCharacterClass(variants));

/** The base icon layer — full cell, unselected color. */
export const rateIconBaseClass = cva(
  [
    "absolute",
    "inset-0",
    "text-[20px]",
    "leading-none",
    "text-on-surface/15",
    "flex",
    "items-center",
    "justify-center",
  ],
  {
    variants: {
      disabled: {
        true: ["!text-on-surface/25"],
        false: [],
      },
    },
    defaultVariants: { disabled: false },
  },
);

export const rateIconBaseWrapClass = (variants: Parameters<typeof rateIconBaseClass>[0]) =>
  twMerge(rateIconBaseClass(variants));

/**
 * The selected overlay — full cell in primary, clipped by an inline
 * `clip-path: inset(0 X% 0 0)` (left-anchored: 50% for a half, 0% full).
 */
export const rateIconFilledClass = cva(
  [
    "absolute",
    "inset-0",
    "text-[20px]",
    "leading-none",
    "text-primary",
    "flex",
    "items-center",
    "justify-center",
    "pointer-events-none",
  ],
  {
    variants: {
      disabled: {
        true: ["!text-on-surface/25"],
        false: [],
      },
    },
    defaultVariants: { disabled: false },
  },
);

export const rateIconFilledWrapClass = (variants: Parameters<typeof rateIconFilledClass>[0]) =>
  twMerge(rateIconFilledClass(variants));

/** The hidden keyboard-focusable listitem wrapper (antd rate is a ul). */
export const rateListClass = () =>
  twMerge(["inline-flex", "items-center", "gap-x-xs", "list-none", "m-0", "p-0"]);
