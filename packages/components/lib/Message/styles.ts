// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// The provider viewport layer: fixed full-width column anchoring the stack
// to top, bottom, or the exact vertical center. pointer-events-none so the
// page below stays clickable; each notice re-enables pointer events on itself.
const messageViewportVariants = cva(
  ["fixed", "left-0", "right-0", "z-[1010]", "pointer-events-none", "flex", "flex-col", "items-center"],
  {
    variants: {
      placement: {
        top: ["top-[8px]"],
        bottom: ["bottom-[8px]", "flex-col-reverse"],
        // Vertically centered: the column is a 0-height strip at the viewport
        // middle; stacking grows downward from that point (flex-col, items
        // below the anchor). justify-start keeps the FIRST notice centered —
        // the stack reads as "grew from the middle" rather than floating up.
        center: ["top-1/2", "-translate-y-1/2"],
      },
    },
    defaultVariants: { placement: "top" },
  }
)

// One notice: surface card, 8px radius, standard shadow. Only
// opacity/transform transition — the stack re-flows on insert/remove, and
// transitioning layout properties would make the whole column wobble.
const messageNoticeVariants = cva(
  [
    "pointer-events-auto", "flex", "items-center", "gap-[8px]",
    "min-w-[180px]", "max-w-[calc(100vw-48px)]", "px-[12px]", "py-[9px]",
    "mb-[8px]",  // stack gap; transitions with the notice so removal slides
    "bg-surface", "rounded-lg", "shadow",
    "text-[14px]", "text-on-surface", "leading-[1.5714]",
    // margin is part of the transition: on removal the notice fades while
    // its margin collapses, so the rest of the stack GLIDES up instead of
    // jumping. (margin-b, not margin-t: the notice below owns the gap.)
    "transition-overlay-stack", "duration-mid", "ease-upthrust",
  ],
  {
    variants: {
      type: {
        info: [],
        success: [],
        warning: [],
        error: [],
        loading: [],
      },
      state: {
        enter: ["opacity-0", "scale-95"],
        visible: ["opacity-100", "scale-100"],
        // Margin collapses to the negative of the gap so the space the
        // notice occupied disappears smoothly — the stack below slides up
        // over the leave animation instead of teleporting.
        closing: ["opacity-0", "scale-90", "-mb-[41px]"],
      },
    },
    defaultVariants: { type: "info", state: "visible" },
  }
)

// Status icon tint. success/warning hex literals: MD3 has no such tokens;
// see the shared values in Alert/Result styles (same antd palette family).
const messageIconVariants = cva(
  ["shrink-0", "text-[16px]"],
  {
    variants: {
      type: {
        info: ["text-primary"],
        success: ["text-[#52c41a]"],
        warning: ["text-[#faad14]"],
        error: ["text-error"],
        loading: ["text-primary"],
      },
    },
    defaultVariants: { type: "info" },
  }
)

const messageContentVariants = cva(
  ["min-w-0", "break-words"],
  { variants: {}, defaultVariants: {} }
)

export const messageViewportClass = (variants: VariantProps<typeof messageViewportVariants>) =>
  twMerge(messageViewportVariants(variants))
export const messageNoticeClass = (variants: VariantProps<typeof messageNoticeVariants>) =>
  twMerge(messageNoticeVariants(variants))
export const messageIconClass = (variants: VariantProps<typeof messageIconVariants>) =>
  twMerge(messageIconVariants(variants))
export const messageContentClass = (variants: VariantProps<typeof messageContentVariants>) =>
  twMerge(messageContentVariants(variants))

// Icon glyph per type; loading spins with the shared spinner animation.
export const MESSAGE_ICONS: Record<string, string> = {
  info: 'i-mdi-information',
  success: 'i-mdi-check-circle',
  warning: 'i-mdi-alert-circle',
  error: 'i-mdi-close-circle',
  loading: 'i-mdi-loading animate-spin-upthrust',
}
