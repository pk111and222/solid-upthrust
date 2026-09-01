// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// ---- wrapper ---------------------------------------------------------------

// antd: `display:inline-block; width:fit-content; position:relative` when
// wrapping children; standalone (`-not-a-wrapper`) drops vertical-align
// tweaks and lets the indicator flow inline.
const badgeWrapperVariants = cva(
  // wrapped mode keeps the wrapper a FLEX context (antd's wrapper is
  // inline-block, but antd icons carry their own display:inline-block —
  // UnoCSS icon spans DON'T, so a raw inline-block wrapper leaves icon
  // children display:inline at 0x0, collapsing the anchor box the pill
  // positions against). inline-flex block-ifies children like every other
  // component here (Breadcrumb item, Avatar icon slot, Dropdown item).
  ["relative", "inline-flex", "items-center", "leading-none"],
  {
    variants: {
      mode: {
        wrapped: [],
        // standalone: the indicator renders in normal flow (antd resets
        // position/transform via -not-a-wrapper), the flex row also hosts
        // the status text beside a status dot.
        standalone: [],
      },
    },
    defaultVariants: { mode: "wrapped" },
  }
);

// ---- count pill ---------------------------------------------------------------

// antd geometry: indicatorHeight 20 (min-width + height + line-height,
// fontSize 12, borderRadius 10) and the SM set 14/12. The pill carries a
// 1px surface ring (badgeShadowColor = colorBorderBg) so it reads on any
// host. Anchor: top-0 right-0 + translate(50%,-50%) + origin 100% 0% —
// all expressed as utilities; standalone mode neutralizes them.
const badgeCountVariants = cva(
  [
    "absolute", "top-0", "right-0",
    "translate-x-1/2", "-translate-y-1/2", "origin-top-right",
    "flex", "items-center", "justify-center",
    "rounded-full", "whitespace-nowrap", "text-center", "select-none",
    "ring-1", "ring-surface",
    // Enter/leave zoom: only opacity + individual transforms, so the
    // anchor translate is never re-transitioned (Popover/Message family).
    "transition-overlay", "duration-mid", "ease-upthrust",
  ],
  {
    variants: {
      // merged size × mode — the standalone form resets the anchor and
      // flows inline (antd -not-a-wrapper: position:relative, transform:none)
      sizeMode: {
        "middle-wrapped": ["min-w-[20px]", "h-[20px]", "text-[12px]", "leading-[20px]", "px-[6px]"],
        "middle-standalone": ["static", "translate-x-0", "-translate-y-0", "origin-center", "min-w-[20px]", "h-[20px]", "text-[12px]", "leading-[20px]", "px-[6px]"],
        "small-wrapped": ["min-w-[14px]", "h-[14px]", "text-[11px]", "leading-[14px]", "px-[4px]"],
        "small-standalone": ["static", "translate-x-0", "-translate-y-0", "origin-center", "min-w-[14px]", "h-[14px]", "text-[11px]", "leading-[14px]", "px-[4px]"],
      },
      // background × foreground per antd statusColor/color — the pill text
      // stays white (colorTextLightSolid) on every solid fill.
      color: {
        error: ["bg-error", "text-on-primary"],
        success: ["bg-[#52c41a]", "text-on-primary"],
        warning: ["bg-[#faad14]", "text-on-primary"],
        processing: ["bg-primary", "text-on-primary"],
        primary: ["bg-primary", "text-on-primary"],
        gray: ["bg-on-surface/25", "text-on-primary"],
        custom: ["bg-transparent", "ring-0"],
      },
      // multi-character counts get horizontal breathing room (antd
      // `-multiple-words`: paddingInline = 8)
      words: {
        true: ["px-[8px]"],
        false: [],
      },
      visible: {
        true: ["opacity-100", "scale-100"],
        false: ["opacity-0", "scale-0", "pointer-events-none"],
      },
    },
    defaultVariants: {
      sizeMode: "middle-wrapped",
      color: "error",
      words: false,
      visible: true,
    },
  }
);

// ---- dot --------------------------------------------------------------------

const badgeDotVariants = cva(
  [
    "absolute", "top-0", "right-0",
    "translate-x-1/2", "-translate-y-1/2",
    "w-[6px]", "h-[6px]", "rounded-full",
    "ring-1", "ring-surface",
    "z-[auto]",
    "transition-overlay", "duration-mid", "ease-upthrust",
  ],
  {
    variants: {
      mode: {
        wrapped: [],
        standalone: ["static", "translate-x-0", "-translate-y-0"],
      },
      color: {
        error: ["bg-error"],
        success: ["bg-[#52c41a]"],
        warning: ["bg-[#faad14]"],
        processing: ["bg-primary"],
        primary: ["bg-primary"],
        gray: ["bg-on-surface/25"],
        custom: ["bg-transparent", "ring-0"],
      },
      visible: {
        true: ["opacity-100", "scale-100"],
        false: ["opacity-0", "scale-0", "pointer-events-none"],
      },
    },
    defaultVariants: { mode: "wrapped", color: "error", visible: true },
  }
);

// ---- status dot (in-flow, with text) -----------------------------------------

// antd -status-dot: inline-block 6px, relative top -1, vertical-align
// middle. The processing variant paints the pulse ring on ::after (the
// dot itself stays put while the ring scales 0.8→2.4 and fades).
const badgeStatusDotVariants = cva(
  [
    "relative", "-top-[1px]", "inline-block", "shrink-0",
    "w-[6px]", "h-[6px]", "rounded-full", "align-middle",
    "z-[auto]",
  ],
  {
    variants: {
      status: {
        success: ["bg-[#52c41a]"],
        processing: [
          "bg-primary", "text-primary", "overflow-visible",
          "after:absolute", "after:inset-0", "after:rounded-full",
          "after:border", "after:border-solid", "after:border-current",
          "after:content-['']", "after:animate-badge-processing",
        ],
        default: ["bg-on-surface/25"],
        error: ["bg-error"],
        warning: ["bg-[#faad14]"],
        gray: ["bg-on-surface/25"],
      },
    },
    defaultVariants: { status: "default" },
  }
);

const badgeStatusTextVariants = cva(
  ["ml-[8px]", "text-[14px]", "text-on-surface", "leading-[inherit]", "align-middle"],
  { variants: {}, defaultVariants: {} }
);

// ---- ribbon -------------------------------------------------------------------

// antd ribbon: absolute at top:8, insetInlineEnd:-8 (placement mirrored),
// padding 0 8, lineHeight badgeFontHeight(22), radius 4, white text on a
// preset-colored band. The fold is an ::after 8×8 box with a 4px current-
// color border; two sides go transparent per placement and scaleY(0.75)
// + brightness(75%) fake the perspective fold.
const ribbonVariants = cva(
  [
    "absolute", "top-[8px]",
    "h-[22px]", "px-[8px]", "leading-[22px]",
    "rounded-sm", "whitespace-nowrap", "select-none",
    "text-[14px]",
  ],
  {
    variants: {
      placement: {
        end: [
          "right-[-8px]", "rounded-br-none",
          "after:absolute", "after:top-full", "after:right-0",
          "after:w-[8px]", "after:h-[8px]",
          "after:border-4", "after:border-solid", "after:border-current",
          "after:border-r-transparent", "after:border-b-transparent",
          "after:content-['']",
          "after:scale-y-75", "after:origin-top", "after:brightness-75",
        ],
        start: [
          "left-[-8px]", "rounded-bl-none",
          "after:absolute", "after:top-full", "after:left-0",
          "after:w-[8px]", "after:h-[8px]",
          "after:border-4", "after:border-solid", "after:border-current",
          "after:border-b-transparent", "after:border-l-transparent",
          "after:content-['']",
          "after:scale-y-75", "after:origin-top", "after:brightness-75",
        ],
      },
      color: {
        blue: ["bg-primary", "text-primary"],
        red: ["bg-error", "text-error"],
        green: ["bg-[#52c41a]", "text-[#52c41a]"],
        gray: ["bg-on-surface/25", "text-on-surface/25"],
        // custom colors set background inline; the text-* class still
        // drives the fold's border-current
        custom: [],
      },
    },
    defaultVariants: { placement: "end", color: "blue" },
  }
);

// The fold inherits `border-current` from the band's text color, but the
// label itself must stay white regardless.
const ribbonContentVariants = cva(
  ["text-on-primary"],
  { variants: {}, defaultVariants: {} }
);

const ribbonWrapperVariants = cva(
  ["relative"],
  { variants: {}, defaultVariants: {} }
);

export const badgeWrapperClass = (variants: VariantProps<typeof badgeWrapperVariants>) =>
  twMerge(badgeWrapperVariants(variants))
export const badgeCountClass = (variants: VariantProps<typeof badgeCountVariants>) =>
  twMerge(badgeCountVariants(variants))
export const badgeDotClass = (variants: VariantProps<typeof badgeDotVariants>) =>
  twMerge(badgeDotVariants(variants))
export const badgeStatusDotClass = (variants: VariantProps<typeof badgeStatusDotVariants>) =>
  twMerge(badgeStatusDotVariants(variants))
export const badgeStatusTextClass = (variants: VariantProps<typeof badgeStatusTextVariants>) =>
  twMerge(badgeStatusTextVariants(variants))
export const ribbonClass = (variants: VariantProps<typeof ribbonVariants>) =>
  twMerge(ribbonVariants(variants))
export const ribbonContentClass = (variants: VariantProps<typeof ribbonContentVariants>) =>
  twMerge(ribbonContentVariants(variants))
export const ribbonWrapperClass = (variants: VariantProps<typeof ribbonWrapperVariants>) =>
  twMerge(ribbonWrapperVariants(variants))
