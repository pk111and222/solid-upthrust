// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// The placement viewport: fixed full-height column pinned to one screen edge
// or corner. pointer-events-none so the page below stays clickable; each
// notice re-enables pointer events on itself. Bottom stacks are column-reverse
// so the newest notice hugs the anchor edge, exactly like rc-notification.
const notificationViewportVariants = cva(
  [
    "fixed", "top-0", "bottom-0", "z-[1000]", "pointer-events-none",
    "flex", "flex-col", "p-md",
  ],
  {
    variants: {
      placement: {
        topLeft: ["left-0", "items-start"],
        top: ["left-1/2", "-translate-x-1/2", "items-center"],
        topRight: ["right-0", "items-end"],
        bottomLeft: ["left-0", "items-start", "flex-col-reverse"],
        bottom: ["left-1/2", "-translate-x-1/2", "items-center", "flex-col-reverse"],
        bottomRight: ["right-0", "items-end", "flex-col-reverse"],
      },
    },
    defaultVariants: { placement: "topRight" },
  }
)

// One notice card: elevated surface, lg radius, standard shadow (antd
// notification visual family). Slide/fade is driven by the `state` variant —
// the slide DIRECTION follows the placement's horizontal side so corner
// stacks enter from their own edge (antd parity: right stacks slide in from
// the right, left stacks from the left, top/bottom fade down/up).
const notificationNoticeVariants = cva(
  [
    "pointer-events-auto", "relative", "overflow-hidden",
    "w-[384px]", "max-w-[calc(100vw-48px)]",
    "mb-md",  // stack gap; margin is transitioned so removal glides the stack
    "bg-surface", "rounded-lg", "shadow",
    "transition-overlay-stack",
    "duration-mid", "ease-upthrust",
  ],
  {
    variants: {
      state: {
        enter: ["opacity-0"],
        visible: ["opacity-100"],
        // max-height + padding collapse: the card below slides up over the
        // leave animation instead of teleporting (mirrors antd fadeOut which
        // animates max-height to 0).
        closing: ["opacity-0", "max-h-0", "py-0", "!mb-0", "!border-0", "scale-95"],
      },
      side: {
        left: [],
        right: [],
        center: [],
      },
    },
    // Slide-in direction composed with the state classes via compound would
    // break UnoCSS scanning, so direction classes live in a dedicated variant
    // pair below (enter transform only — see notificationEnterVariants).
    defaultVariants: { state: "visible", side: "right" },
  }
)

// Enter transform per side: applied only in the `enter` state, removed on
// `visible` so the card transitions from off-screen to its resting place.
const notificationEnterVariants = cva(
  ["transition-overlay-stack", "duration-mid", "ease-upthrust"],
  {
    variants: {
      side: {
        left: ["-translate-x-full"],
        right: ["translate-x-full"],
        center: ["translate-y-[16px]", "scale-95"],
      },
    },
    defaultVariants: { side: "right" },
  }
)

// Card body padding: py-md px-lg (antd notificationPadding = 16px 24px).
const notificationBodyVariants = cva(
  ["relative", "py-md", "px-lg"],
  { variants: {}, defaultVariants: {} }
)

// Message title: 16px medium heading color (antd fontSizeLG + colorTextHeading).
const notificationMessageVariants = cva(
  ["text-on-surface", "text-[16px]", "font-medium", "leading-[1.5]", "pr-lg"],
  {
    variants: {
      withIcon: { true: ["ml-[36px]"], false: [] },
    },
    defaultVariants: { withIcon: false },
  }
)

// Description body: 14px regular, secondary color.
const notificationDescriptionVariants = cva(
  ["text-on-surface", "text-[14px]", "leading-[1.5714]", "mt-xs", "break-words"],
  {
    variants: {
      withIcon: { true: ["ml-[36px]"], false: [] },
    },
    defaultVariants: { withIcon: false },
  }
)

// Type icon: 24px (fontSizeLG * lineHeightLG), absolutely positioned at the
// card's top-left padding corner like antd's notice-icon.
const notificationIconVariants = cva(
  ["absolute", "left-lg", "top-md", "text-[24px]", "leading-none", "w-[24px]", "h-[24px]"],
  {
    variants: {
      type: {
        info: ["text-primary", "i-mdi-information"],
        success: ["text-[#52c41a]", "i-mdi-check-circle"],
        warning: ["text-[#faad14]", "i-mdi-alert-circle"],
        error: ["text-error", "i-mdi-close-circle"],
      },
    },
    defaultVariants: { type: "info" },
  }
)

// Close button: 22px square hit area in the card's top-right padding corner.
const notificationCloseVariants = cva(
  [
    "absolute", "top-[11px]", "right-[11px]",
    "inline-flex", "items-center", "justify-center",
    "w-[22px]", "h-[22px]",
    "text-[14px]", "text-on-surface-variant",
    "cursor-pointer", "border-none",
    "rounded-sm", "outline-none",
    "transition-upthrust-fast",
    "hover:text-on-surface", "hover:bg-on-surface/6",
  ],
  { variants: {}, defaultVariants: {} }
)

// Action area (btn slot): floated right under the description like antd's
// notice-btn (float:right + margin-top).
const notificationActionsVariants = cva(
  ["mt-sm", "flex", "justify-end"],
  { variants: {}, defaultVariants: {} }
)

// Countdown progress bar: 2px strip along the card's bottom, rounded ends,
// primary gradient fill (antd notificationProgressBg gradient family).
const notificationProgressVariants = cva(
  [
    "absolute", "bottom-0", "left-lg", "right-lg", "h-[2px]",
    "rounded-full", "bg-on-surface/8", "overflow-hidden",
  ],
  { variants: {}, defaultVariants: {} }
)

const notificationProgressFillVariants = cva(
  ["h-full", "rounded-full", "bg-primary"],
  { variants: {}, defaultVariants: {} }
)

export const notificationViewportClass = (variants: VariantProps<typeof notificationViewportVariants>) =>
  twMerge(notificationViewportVariants(variants))
export const notificationNoticeClass = (variants: VariantProps<typeof notificationNoticeVariants>) =>
  twMerge(notificationNoticeVariants(variants))
export const notificationEnterClass = (variants: VariantProps<typeof notificationEnterVariants>) =>
  twMerge(notificationEnterVariants(variants))
export const notificationBodyClass = (variants: VariantProps<typeof notificationBodyVariants>) =>
  twMerge(notificationBodyVariants(variants))
export const notificationMessageClass = (variants: VariantProps<typeof notificationMessageVariants>) =>
  twMerge(notificationMessageVariants(variants))
export const notificationDescriptionClass = (variants: VariantProps<typeof notificationDescriptionVariants>) =>
  twMerge(notificationDescriptionVariants(variants))
export const notificationIconClass = (variants: VariantProps<typeof notificationIconVariants>) =>
  twMerge(notificationIconVariants(variants))
export const notificationCloseClass = (variants: VariantProps<typeof notificationCloseVariants>) =>
  twMerge(notificationCloseVariants(variants))
export const notificationActionsClass = (variants: VariantProps<typeof notificationActionsVariants>) =>
  twMerge(notificationActionsVariants(variants))
export const notificationProgressClass = (variants: VariantProps<typeof notificationProgressVariants>) =>
  twMerge(notificationProgressVariants(variants))
export const notificationProgressFillClass = (variants: VariantProps<typeof notificationProgressFillVariants>) =>
  twMerge(notificationProgressFillVariants(variants))

// Close glyph (shared with Alert's ×).
export const NOTIFICATION_CLOSE_ICON = 'i-mdi-close'
