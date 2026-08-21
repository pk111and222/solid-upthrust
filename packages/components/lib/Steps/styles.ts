// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const stepsContainerVariants = cva(
  ["flex", "gap-0"],
  {
    variants: {
      direction: {
        horizontal: ["flex-row", "items-start"],
        vertical: ["flex-col"],
      },
    },
    defaultVariants: { direction: "horizontal" },
  }
);

const stepItemVariants = cva(
  ["flex", "items-start", "relative"],
  {
    variants: {
      direction: {
        // Horizontal keeps the circle as the height ANCHOR: the circle's top
        // stays at the row top so the connector's fixed mt (circle radius)
        // always passes through its center, regardless of description height.
        horizontal: ["flex-1"],
        vertical: ["pb-6"],
      },
    },
    defaultVariants: { direction: "horizontal" },
  }
);

// Title block beside the circle (horizontal only): exactly one control tall
// so the text vertically centers against the circle without shifting it.
const stepTitleRowVariants = cva(
  ["flex", "items-center", "min-w-0", "shrink"],
  {
    variants: {
      size: {
        default: ["h-[32px]"],
        small: ["h-[24px]"],
      },
    },
    defaultVariants: { size: "default" },
  }
);

// Merged status × (icon content) keys — icons live here as scannable cva
// literals (JSX icon classes extract unreliably; see Pagination ellipsis).
// NOTE: the icon element itself gets NO bg-* utility — mask icons render via
// background-color:currentColor, which any bg-* would defeat.
const stepIconVariants = cva(
  [
    "rounded-full", "flex", "items-center", "justify-center",
    "font-medium", "shrink-0", "border", "border-solid", "transition-upthrust",
    "select-none",
  ],
  {
    variants: {
      status: {
        finish: ["bg-transparent", "border-primary", "text-primary"],
        process: ["bg-primary", "border-primary", "text-on-primary"],
        wait: ["bg-transparent", "border-on-surface/25", "text-on-surface/45"],
        error: ["bg-transparent", "border-error", "text-error"],
      },
      size: {
        default: ["w-[32px]", "h-[32px]", "text-[14px]"],
        small: ["w-[24px]", "h-[24px]", "text-[12px]"],
      },
    },
    defaultVariants: { status: "wait", size: "default" },
  }
);

// Status glyph for the icon circle when the step has no custom icon.
const stepGlyphVariants = cva(
  ["w-[1em]", "h-[1em]"],
  {
    variants: {
      glyph: {
        check: ["i-mdi-check"],
        close: ["i-mdi-close"],
        // numbers render as text; no icon class needed
        number: [],
      },
    },
    defaultVariants: { glyph: "number" },
  }
);

// Connector geometry:
// - vertical: rendered inside a flex-col items-center column directly under
//   the circle — items-center already centers it under the circle, so NO
//   left margin (an ml here would double-shift it off center).
// - horizontal: sits between step columns; its top offset must equal the
//   circle's radius (default 32px→16px, small 24px→12px) so the line passes
//   exactly through the circle centers. Merged direction×size keys keep the
//   utilities in scannable variant values (no compoundVariants).
const stepConnectorVariants = cva(
  ["border-solid", "transition-upthrust"],
  {
    variants: {
      status: {
        finish: ["border-primary"],
        process: ["border-on-surface/15"],
        wait: ["border-on-surface/15"],
        error: ["border-on-surface/15"],
      },
      dirSize: {
        "horizontal-default": ["flex-1", "mx-[8px]", "mt-[16px]", "border-t"],
        "horizontal-small": ["flex-1", "mx-[8px]", "mt-[12px]", "border-t"],
        "vertical-default": ["my-[4px]", "min-h-[24px]", "border-l"],
        "vertical-small": ["my-[4px]", "min-h-[16px]", "border-l"],
      },
    },
    defaultVariants: { status: "wait", dirSize: "horizontal-default" },
  }
);

const stepTitleVariants = cva(
  ["text-[14px]", "transition-upthrust-fast", "leading-[22px]"],
  {
    variants: {
      status: {
        finish: ["text-on-surface"],
        process: ["text-on-surface", "font-medium"],
        wait: ["text-on-surface-variant"],
        error: ["text-error"],
      },
    },
    defaultVariants: { status: "wait" },
  }
);

const stepSubTitleVariants = cva(
  ["text-[12px]", "ml-[8px]", "inline", "text-on-surface-variant", "font-normal"],
  {
    variants: {
      status: {
        finish: ["text-on-surface-variant"],
        process: ["text-on-surface-variant"],
        wait: ["text-on-surface-variant/60"],
        error: ["text-error/80"],
      },
    },
    defaultVariants: { status: "wait" },
  }
);

const stepDescriptionVariants = cva(
  ["text-[12px]", "mt-[4px]", "max-w-[160px]"],
  {
    variants: {
      status: {
        finish: ["text-on-surface-variant"],
        process: ["text-on-surface-variant"],
        wait: ["text-on-surface-variant/60"],
        error: ["text-error/80"],
      },
    },
    defaultVariants: { status: "wait" },
  }
);

// Progress dot (progressDot mode): small dot instead of the numbered
// circle, with a filled sub-track for the current step's percent.
const stepDotVariants = cva(
  ["rounded-full", "transition-upthrust", "shrink-0"],
  {
    variants: {
      status: {
        finish: ["bg-primary"],
        process: ["bg-primary"],
        wait: ["bg-on-surface/20"],
        error: ["bg-error"],
      },
      size: {
        default: ["w-[8px]", "h-[8px]"],
        small: ["w-[6px]", "h-[6px]"],
      },
    },
    defaultVariants: { status: "wait", size: "default" },
  }
);

export const stepsContainerClass = (variants: VariantProps<typeof stepsContainerVariants>) => twMerge(stepsContainerVariants(variants));
export const stepItemClass = (variants: VariantProps<typeof stepItemVariants>) => twMerge(stepItemVariants(variants));
export const stepTitleRowClass = (variants: VariantProps<typeof stepTitleRowVariants>) => twMerge(stepTitleRowVariants(variants));
export const stepIconClass = (variants: VariantProps<typeof stepIconVariants>) => twMerge(stepIconVariants(variants));
export const stepGlyphClass = (variants: VariantProps<typeof stepGlyphVariants>) => twMerge(stepGlyphVariants(variants));
export const stepConnectorClass = (variants: VariantProps<typeof stepConnectorVariants>) => twMerge(stepConnectorVariants(variants));
export const stepTitleClass = (variants: VariantProps<typeof stepTitleVariants>) => twMerge(stepTitleVariants(variants));
export const stepSubTitleClass = (variants: VariantProps<typeof stepSubTitleVariants>) => twMerge(stepSubTitleVariants(variants));
export const stepDescriptionClass = (variants: VariantProps<typeof stepDescriptionVariants>) => twMerge(stepDescriptionVariants(variants));
export const stepDotClass = (variants: VariantProps<typeof stepDotVariants>) => twMerge(stepDotVariants(variants));
