// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const alertContainerVariants = cva(
  [
    "relative", "flex", "break-words",
    "border", "border-solid",
    // Leave animation: the CONTENT fades on its own fast track (see
    // alertContentVariants) while this container only animates the BOX
    // collapse (padding/border, duration-mid) — the phases are deliberately
    // SPLIT so the text is gone before the box starts visibly squeezing it,
    // which is what rc-motion's fade-out reads like. Sharing one transition
    // for both made the box finish collapsing while the text was still
    // half-visible, and overflow-hidden then snapped it away.
    "transition-[padding,border]", "duration-mid", "ease-upthrust",
  ],
  {
    variants: {
      type: {
        // /10-style tints: solid light hex backgrounds break dark themes
        // (light bg + light text = unreadable). Borders use the icon color
        // at low opacity, mirroring the info variant's pattern.
        success: ["bg-[#52c41a]/10", "border-[#52c41a]/40"],
        info: ["bg-primary-container/15", "border-primary/30"],
        warning: ["bg-[#faad14]/10", "border-[#faad14]/40"],
        error: ["bg-error/10", "border-error/40"],
      },
      hasDescription: {
        // Single-row alerts center their content vertically (antd keeps the
        // icon and text on one optical line; with an action row taller than
        // the text this also keeps the text from hugging the top edge and
        // leaving a fat bottom gap).
        true: ["items-start", "py-[20px]", "px-[24px]", "rounded-lg"],
        false: ["items-center", "py-[8px]", "px-[12px]", "rounded-lg"],
      },
      banner: {
        true: ["!rounded-none", "border-x-0", "border-t-0"],
        false: [],
      },
      closing: {
        // Box collapse only — the fade lives on the content wrapper so the
        // two motions can run at different speeds (content: fast, box: mid).
        true: ["!py-0", "!border-0", "overflow-hidden"],
        false: [],
      },
    },
    defaultVariants: {
      type: "info",
      hasDescription: false,
      banner: false,
      closing: false,
    },
  }
);

// Content wrapper (icon + text + action): fades out QUICKLY (duration-fast)
// when closing. The box collapse on the container runs at duration-mid, so
// by the time the box starts squeezing the strip, the content is already
// invisible — no "text suddenly vanishing inside a shrinking box".
const alertContentVariants = cva(
  ["flex", "items-center", "w-full", "min-w-0", "transition-opacity", "duration-fast", "ease-upthrust-out"],
  {
    variants: {
      closing: {
        true: ["opacity-0"],
        false: ["opacity-100"],
      },
      hasDescription: {
        true: ["items-start"],
        false: [],
      },
    },
    defaultVariants: { closing: false, hasDescription: false },
  }
);

const alertIconVariants = cva(
  ["shrink-0", "mr-[8px]"],
  {
    variants: {
      type: {
        success: ["text-[#52c41a]", "i-mdi-check-circle"],
        info: ["text-primary", "i-mdi-information"],
        warning: ["text-[#faad14]", "i-mdi-alert"],
        error: ["text-error", "i-mdi-close-circle"],
      },
      hasDescription: {
        true: ["text-[24px]", "mt-[1px]"],
        false: ["text-[16px]", "mt-[1px]"],
      },
    },
    defaultVariants: {
      type: "info",
      hasDescription: false,
    },
  }
);

const alertMessageVariants = cva(
  ["text-on-surface"],
  {
    variants: {
      hasDescription: {
        true: ["text-[16px]", "font-medium", "mb-[4px]"],
        false: ["text-[14px]"],
      },
    },
    defaultVariants: { hasDescription: false },
  }
);

const alertDescriptionVariants = cva(
  ["text-[14px]", "text-on-surface-variant", "leading-[1.5714]"],
  { variants: {}, defaultVariants: {} }
);

// Close button: absolutely positioned at the alert's right padding corner.
// Without a description the alert is a single text row — the × centers on
// that row (top 1/2) so a taller action row can't push it off-center; with a
// description it aligns to the title row like antd.
const alertCloseVariants = cva(
  [
    "absolute", "right-[12px]",
    "inline-flex", "items-center", "justify-center",
    "w-[22px]", "h-[22px]",
    "text-on-surface-variant", "cursor-pointer", "border-none", "bg-transparent",
    "rounded-sm", "transition-upthrust-fast",
    "hover:text-on-surface",
  ],
  {
    variants: {
      hasDescription: {
        true: ["top-[20px]", "right-[24px]"],
        false: ["top-1/2", "-translate-y-1/2"],
      },
    },
    defaultVariants: { hasDescription: false },
  }
);

// Action slot: vertically centered inline row after the content. When the
// alert is closable the absolute × overlaps this area, so reserve room on the
// right (antd reserves via the message's padding-right; we do it on the
// action wrapper — same visual outcome, one place).
const alertActionVariants = cva(
  ["ml-[8px]", "self-center", "shrink-0"],
  {
    variants: {
      closable: {
        true: ["pr-[30px]"],
        false: [],
      },
    },
    defaultVariants: { closable: false },
  }
);

export const alertContainerClass = (variants: VariantProps<typeof alertContainerVariants>) => twMerge(alertContainerVariants(variants));
export const alertContentClass = (variants: VariantProps<typeof alertContentVariants>) => twMerge(alertContentVariants(variants));
export const alertIconClass = (variants: VariantProps<typeof alertIconVariants>) => twMerge(alertIconVariants(variants));
export const alertMessageClass = (variants: VariantProps<typeof alertMessageVariants>) => twMerge(alertMessageVariants(variants));
export const alertDescriptionClass = (variants: VariantProps<typeof alertDescriptionVariants>) => twMerge(alertDescriptionVariants(variants));
export const alertCloseClass = (variants: VariantProps<typeof alertCloseVariants>) => twMerge(alertCloseVariants(variants));
export const alertActionClass = (variants: VariantProps<typeof alertActionVariants>) => twMerge(alertActionVariants(variants));
