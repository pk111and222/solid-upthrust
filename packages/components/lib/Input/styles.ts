// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

/**
 * Input styles — antd6 visual alignment:
 *
 *  ┌─ rc-input DOM contract ─────────────────────────────────────────────┐
 *  │ The affix wrapper is ALWAYS rendered (display:inline-flex), even    │
 *  │ with no prefix/suffix. The <input> itself is borderless/transparent │
 *  │ inside it. Two visual modes share the same DOM tree:                │
 *  │   - bare input: the WRAPPER carries no border, the INPUT carries it │
 *  │   - affix input: the WRAPPER carries the border, input stays bare   │
 *  │ Switching between modes must never remount the <input> (focus!).    │
 *  └────────────────────────────────────────────────────────────────────┘
 *
 *  - focus ring: antd activeShadow `0 0 0 2px controlOutline` — wind4's
 *    ring IS a box-shadow (--un-ring-shadow), so ring-2 + ring-primary/10
 *    compiles to exactly that.
 *  - status colors: error uses the error token; warning has NO MD3 token
 *    (solid-material-color exposes none), so it stays on the literal
 *    #faad14 used across the library (Alert/Result/Form feedback).
 *  - sizes: antd6 paddingInline = 11px (middle/large) / 7px (small),
 *    font 14/16/12, heights via the h-control family.
 *  - affix spacing: antd inputAffixPadding = 4px between input edge and
 *    affix content; the OUTER frame padding stays 11px (small 7px), so a
 *    suffix-only input keeps its left padding (asymmetric-padding bug fix).
 */

const inputVariants = cva(
  [
    "relative",
    "inline-flex",
    "items-center",
    "w-full",
    "min-w-0",
    "text-on-surface",
    "outline-none",
    "placeholder:text-on-surface/25",
    "transition-upthrust",
    // bare (no-affix) mode: the input itself carries the frame
    "bg-surface",
    "rounded",
    "border",
    "border-solid",
    "border-outline",
    "hover:border-primary",
    "focus:border-primary",
    "focus:ring-2",
    "focus:ring-primary/10",
  ],
  {
    variants: {
      size: {
        small: ["h-control-sm", "px-[7px]", "text-[12px]"],
        middle: ["h-control", "px-[11px]", "text-[14px]"],
        large: ["h-control-lg", "px-[11px]", "text-[16px]"],
      },
      status: {
        default: [],
        error: [
          "!border-error", "hover:!border-error",
          "focus:!border-error", "focus:!ring-error/8",
        ],
        warning: [
          "!border-[#faad14]", "hover:!border-[#faad14]",
          "focus:!border-[#faad14]", "focus:!ring-[#faad14]/10",
        ],
      },
      disabled: {
        true: [
          "!bg-on-surface/4", "!text-on-surface/25", "!border-on-surface/15",
          "cursor-not-allowed",
          "hover:!border-on-surface/15",
          "focus:!ring-transparent",
        ],
        false: [],
      },
      // affix mode: the wrapper owns border/padding, input goes bare
      inWrapper: {
        true: [
          "!bg-transparent", "!border-transparent", "!rounded-none",
          "!px-0", "!ring-0",
          "focus:!ring-transparent",
          "hover:!border-transparent",
        ],
        false: [],
      },
    },
    defaultVariants: {
      size: "middle",
      status: "default",
      disabled: false,
      inWrapper: false,
    },
  }
);

const wrapperVariants = cva(
  [
    "inline-flex",
    "items-center",
    "w-full",
    "min-w-0",
    "bg-surface",
    "rounded",
    "border",
    "border-solid",
    "border-outline",
    "transition-upthrust",
    "hover:border-primary",
    "focus-within:border-primary",
    "focus-within:ring-2",
    "focus-within:ring-primary/10",
  ],
  {
    variants: {
      size: {
        small: ["h-control-sm", "text-[12px]"],
        middle: ["h-control", "text-[14px]"],
        large: ["h-control-lg", "text-[16px]"],
      },
      status: {
        default: [],
        error: [
          "!border-error", "hover:!border-error",
          "focus-within:!border-error", "focus-within:!ring-error/8",
        ],
        warning: [
          "!border-[#faad14]", "hover:!border-[#faad14]",
          "focus-within:!border-[#faad14]", "focus-within:!ring-[#faad14]/10",
        ],
      },
      disabled: {
        true: [
          "!bg-on-surface/4", "!border-on-surface/15",
          "cursor-not-allowed",
          "hover:!border-on-surface/15",
          "focus-within:!ring-transparent",
        ],
        false: [],
      },
      // Affix-mode inline padding: the side WITHOUT an affix keeps the full
      // frame padding (antd: bare edges keep paddingInline); the side WITH
      // an affix shrinks to the 4px inputAffixPadding gap.
      affixLayout: {
        prefixOnly: ["pl-[4px]", "pr-[11px]"],
        suffixOnly: ["pl-[11px]", "pr-[4px]"],
        both: ["pl-[4px]", "pr-[4px]"],
        none: [],
      },
    },
    defaultVariants: {
      size: "middle",
      status: "default",
      disabled: false,
      affixLayout: "none",
    },
  }
);

/** The <input> element itself — always borderless; visual frame lives on
 *  the bare-input cva or the wrapper cva above depending on affix mode. */
const innerInputVariants = cva(
  [
    "flex-1",
    "min-w-0",
    "h-full",
    "bg-transparent",
    "outline-none",
    "border-none",
    "p-0",
    "text-on-surface",
    "placeholder:text-on-surface/25",
    "[color-scheme:light]",
  ],
  {
    variants: {
      disabled: {
        true: ["cursor-not-allowed", "!text-on-surface/25"],
        false: [],
      },
      size: {
        small: ["text-[12px]"],
        middle: ["text-[14px]"],
        large: ["text-[16px]"],
      },
    },
    defaultVariants: {
      disabled: false,
      size: "middle",
    },
  }
);

/**
 * Affix slot — sits INSIDE the wrapper frame. antd affix paddings:
 *   - prefix: marginInlineEnd = inputAffixPadding (4px)
 *   - suffix: marginInlineStart = inputAffixPadding (4px)
 * The frame-side padding (11px/7px) lives on the WRAPPER via affixLayout,
 * NOT here — this keeps the clear-icon-only input's text at 11px from the
 * left edge (the asymmetric padding bug).
 */
export const affixVariants = cva(
  [
    "flex",
    "items-center",
    "shrink-0",
    "gap-[4px]",
    "text-on-surface-variant",
  ],
  {
    variants: {
      side: {
        prefix: ["mr-[4px]"],
        suffix: ["ml-[4px]"],
      },
      size: {
        small: ["text-[12px]"],
        middle: ["text-[14px]"],
        large: ["text-[16px]"],
      },
      clickable: {
        true: ["cursor-pointer", "transition-upthrust-fast", "hover:text-on-surface"],
        false: [],
      },
    },
    defaultVariants: { side: "prefix", clickable: false, size: "middle" },
  }
);

/** antd clear icon: colorTextQuaternary, hover colorTextTertiary, font
 *  size = fontSizeIcon (12). visibility toggles WITHOUT unmounting (the
 *  -hidden class), so the suffix row never reflows its siblings. */
export const clearIconVariants = cva(
  [
    "flex",
    "items-center",
    "justify-center",
    "text-[12px]",
    "leading-none",
    "text-on-surface/25",
    "cursor-pointer",
    "transition-upthrust-fast",
    "hover:text-on-surface/45",
    "active:text-on-surface",
  ],
  {
    variants: {
      // antd keeps the icon mounted and toggles visibility — a conditional
      // <Show> here would rebuild the suffix span and could disturb focus.
      visible: {
        true: [],
        false: ["invisible", "pointer-events-none"],
      },
    },
    defaultVariants: { visible: false },
  }
);

export type InputStyleVariants = VariantProps<typeof wrapperVariants> &
  VariantProps<typeof innerInputVariants>

export const inputClass = (variants: InputStyleVariants & { inWrapper?: boolean }) =>
  twMerge(inputVariants(variants))
export const innerInputClass = (variants: VariantProps<typeof innerInputVariants>) =>
  twMerge(innerInputVariants(variants))
export const inputWrapperClass = (variants: VariantProps<typeof wrapperVariants>) =>
  twMerge(wrapperVariants(variants))
export const affixClass = (variants: VariantProps<typeof affixVariants>) =>
  twMerge(affixVariants(variants))
export const clearIconClass = (variants: VariantProps<typeof clearIconVariants>) =>
  twMerge(clearIconVariants(variants))

/**
 * TextArea — antd6 textarea styles. Unlike the bare <input>, a <textarea>
 * must NOT borrow the h-control token: its height comes from content and
 * `rows`, never a fixed control height. Padding 4px ∀y / 11px ∀x matches
 * the input frame; line-height 1.5714 reproduces antd's word-wrapping
 * density. There is no SizeType here because antd has no sm/lg for textarea.
 */
const textAreaVariants = cva(
  [
    "block",
    "w-full",
    "min-w-0",
    "text-on-surface",
    "outline-none",
    "placeholder:text-on-surface/25",
    "transition-upthrust",
    "bg-surface",
    "rounded",
    "border",
    "border-solid",
    "border-outline",
    "hover:border-primary",
    "focus:border-primary",
    "focus:ring-2",
    "focus:ring-primary/10",
    "px-[11px]",
    "py-[4px]",
    "text-[14px]",
    "leading-[1.5714]",
    "resize-y",
    "h-auto",
    "whitespace-pre-wrap",
  ],
  {
    variants: {
      status: {
        default: [],
        error: [
          "!border-error", "hover:!border-error",
          "focus:!border-error", "focus:!ring-error/8",
        ],
        warning: [
          "!border-[#faad14]", "hover:!border-[#faad14]",
          "focus:!border-[#faad14]", "focus:!ring-[#faad14]/10",
        ],
      },
      disabled: {
        true: [
          "!bg-on-surface/4", "!text-on-surface/25", "!border-on-surface/15",
          "cursor-not-allowed",
          "hover:!border-on-surface/15",
          "focus:!ring-transparent",
        ],
        false: [],
      },
      autoSize: {
        true: ["!resize-none", "overflow-y-hidden"],
        false: [],
      },
    },
    defaultVariants: { status: "default", disabled: false, autoSize: false },
  }
)
export const textAreaClass = (variants: VariantProps<typeof textAreaVariants>) =>
  twMerge(textAreaVariants(variants))
