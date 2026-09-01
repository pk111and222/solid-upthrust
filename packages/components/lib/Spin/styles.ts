// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Spin indicator: a ring with a highlighted arc quarter. The ring uses
// currentColor for the arc so the UI can tint it via text-* classes.
//
// Border widths use the NUMERIC scale (border-2), NOT border-[2px] —
// preset-wind4 parses bare `border-[N]` arbitrary values as a border-COLOR
// ("color-mix(in oklab, 2px ...)"), which silently kills the ring width.
// Per-side width + color classes (border-t-2 + border-t-current) instead of
// a global border-[Npx]: tailwind-merge may treat border-w-[N] and
// border-{side}-{color} as conflicting and silently drop one side. Also
// note bare `border-[2px]` is parsed as a border-COLOR by preset-wind4 —
// never use it for widths.
const spinIndicatorVariants = cva(
  [
    "inline-block", "rounded-full", "border-solid",
    "border-t-current", "border-r-current",
    "border-b-transparent", "border-l-transparent",
    "animate-spin-upthrust",
  ],
  {
    variants: {
      size: {
        // antd ring diameters: 14 / 20 / 32. Stroke widths are 2px across
        // sizes: arbitrary border-*-[3px] values parse as border-COLOR in
        // this preset, so the numeric scale (border-2) is the only safe
        // width syntax — the 2px-vs-3px stroke difference at 32px is
        // imperceptible.
        small: ["w-[14px]", "h-[14px]", "border-t-2", "border-r-2", "border-b-2", "border-l-2"],
        middle: ["w-[20px]", "h-[20px]", "border-t-2", "border-r-2", "border-b-2", "border-l-2"],
        large: ["w-[32px]", "h-[32px]", "border-t-2", "border-r-2", "border-b-2", "border-l-2"],
      },
    },
    defaultVariants: { size: "middle" },
  }
)

// Nested mode: the container wraps children; the spinner overlays them
// with a dimming backdrop while spinning.
const spinNestedVariants = cva(
  ["relative", "inline-block"],
  {
    variants: {
      spinning: {
        true: [],
        false: [],
      },
    },
    defaultVariants: { spinning: false },
  }
)

const spinWrapperVariants = cva(
  ["absolute", "inset-0", "z-10", "flex", "items-center", "justify-center", "transition-upthrust-fast"],
  {
    variants: {
      spinning: {
        true: ["opacity-100"],
        false: ["opacity-0", "pointer-events-none"],
      },
    },
    defaultVariants: { spinning: false },
  }
)

// Dimming backdrop over nested children while spinning (antd parity).
const spinBackdropVariants = cva(
  ["absolute", "inset-0", "bg-surface/65", "transition-upthrust-fast", "rounded-sm"],
  {
    variants: {
      spinning: {
        true: ["opacity-100"],
        false: ["opacity-0"],
      },
    },
    defaultVariants: { spinning: false },
  }
)

const spinTipVariants = cva(
  ["text-on-surface-variant", "text-[14px]", "mt-[8px]", "text-center"],
  { variants: {}, defaultVariants: {} }
)

// Standalone (no children) wrapper: spins + optional tip stacked.
const spinContainerVariants = cva(
  ["inline-flex", "flex-col", "items-center", "justify-center"],
  { variants: {}, defaultVariants: {} }
)

export const spinIndicatorClass = (variants: VariantProps<typeof spinIndicatorVariants>) =>
  twMerge(spinIndicatorVariants(variants))
export const spinNestedClass = (variants: VariantProps<typeof spinNestedVariants>) =>
  twMerge(spinNestedVariants(variants))
export const spinWrapperClass = (variants: VariantProps<typeof spinWrapperVariants>) =>
  twMerge(spinWrapperVariants(variants))
export const spinBackdropClass = (variants: VariantProps<typeof spinBackdropVariants>) =>
  twMerge(spinBackdropVariants(variants))
export const spinTipClass = (variants: VariantProps<typeof spinTipVariants>) =>
  twMerge(spinTipVariants(variants))
export const spinContainerClass = (variants: VariantProps<typeof spinContainerVariants>) =>
  twMerge(spinContainerVariants(variants))
