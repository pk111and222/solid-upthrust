// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Wrapper: inline-block relative box sizing the image (and hosting the
// hover mask + placeholder layers).
const imageWrapperVariants = cva(
  ["relative", "inline-block", "overflow-hidden", "rounded", "bg-surface-variant"],
  { variants: {}, defaultVariants: {} }
)

// The img element itself: block display inside the wrapper.
const imageImgVariants = cva(
  ["block", "w-full", "h-full", "object-cover", "select-none"],
  {
    variants: {
      // Dim the thumbnail slightly; the hover mask covers interaction.
      interactive: {
        true: ["cursor-zoom-in"],
        false: [],
      },
    },
    defaultVariants: { interactive: false },
  }
)

// Loading placeholder: centered spinner over the tinted box.
const imagePlaceholderVariants = cva(
  ["absolute", "inset-0", "flex", "items-center", "justify-center", "bg-surface-variant"],
  { variants: {}, defaultVariants: {} }
)

// Error fallback: centered broken-image glyph + hint.
const imageErrorVariants = cva(
  [
    "absolute", "inset-0", "flex", "flex-col", "items-center", "justify-center", "gap-xs",
    "text-on-surface/35", "bg-surface-variant",
  ],
  { variants: {}, defaultVariants: {} }
)

// Hover mask: "预览" affordance with an eye glyph, fades in on hover.
// Only rendered when preview is enabled.
const imageMaskVariants = cva(
  [
    "absolute", "inset-0", "flex", "items-center", "justify-center", "gap-xs",
    "bg-black/35", "text-white", "text-[14px]",
    "opacity-0", "transition-opacity", "duration-fast", "ease-upthrust",
    "group-hover:opacity-100", "cursor-zoom-in",
  ],
  { variants: {}, defaultVariants: {} }
)

// ---- preview overlay --------------------------------------------------------

// Fullscreen backdrop: black scrim, FLEX-CENTERED image (scrollable when the
// zoomed image overflows), bottom toolbar, top-right close.
const imagePreviewVariants = cva(
  [
    "fixed", "inset-0", "z-[1080]",
    "flex", "items-center", "justify-center", "overflow-auto", "p-md",
    "bg-black/85",
    "transition-opacity", "duration-mid", "ease-upthrust",
  ],
  {
    variants: {
      visible: {
        true: ["opacity-100"],
        false: ["opacity-0", "pointer-events-none"],
      },
    },
    defaultVariants: { visible: false },
  }
)

// The previewed image: centered, transform driven by the headless transform
// (scale + rotate). transition-overlay covers transform/translate/scale.
const imagePreviewImgVariants = cva(
  [
    "max-w-[86vw]", "max-h-[82vh]", "object-contain", "select-none",
    "transition-overlay", "duration-mid", "ease-upthrust",
  ],
  { variants: {}, defaultVariants: {} }
)

// Operations toolbar: centered pill at the bottom of the preview.
const imagePreviewToolbarVariants = cva(
  [
    "absolute", "bottom-[32px]", "left-1/2", "-translate-x-1/2",
    "flex", "items-center", "gap-[8px]",
    "px-[12px]", "py-[6px]", "rounded-full",
    "bg-black/50", "text-white", "text-[18px]",
  ],
  { variants: {}, defaultVariants: {} }
)

// One toolbar button: circular translucent hit area. The glyph is a CHILD
// span — hover:bg-white/15 on the same element would override the mask
// icon's background-color: currentColor and the glyph vanishes on hover.
const imagePreviewOpVariants = cva(
  [
    "inline-flex", "items-center", "justify-center",
    "w-[32px]", "h-[32px]", "rounded-full",
    "text-[18px]", "text-white", "cursor-pointer", "border-none",
    "transition-upthrust-fast",
    "hover:bg-white/15",
  ],
  { variants: {}, defaultVariants: {} }
)

// Close button: top-right of the preview. The glyph is a CHILD span — a bg-*
// on this same element would override the mask icon's currentColor fill.
const imagePreviewCloseVariants = cva(
  [
    "absolute", "top-[24px]", "right-[24px]",
    "inline-flex", "items-center", "justify-center",
    "w-[36px]", "h-[36px]", "rounded-full",
    "text-[20px]", "text-white", "cursor-pointer", "border-none",
    "transition-upthrust-fast",
    "hover:bg-white/15",
  ],
  { variants: {}, defaultVariants: {} }
)

// ---- preview group (shared overlay over multiple images) --------------------

// Switch arrows: vertically centered on the left/right edges, translucent
// pill that lightens on hover (antd preview-group arrows). Icon is a CHILD
// span — never put a bg-* on the same element as an i-mdi-* class.
const imagePreviewArrowVariants = cva(
  [
    "absolute", "top-1/2", "-translate-y-1/2", "z-[1]",
    "inline-flex", "items-center", "justify-center",
    "w-[40px]", "h-[40px]", "rounded-full",
    "text-[24px]", "text-white", "cursor-pointer", "border-none",
    "bg-black/30",
    "transition-upthrust-fast",
    "hover:bg-black/50",
  ],
  {
    variants: {
      side: {
        left: ["left-[24px]"],
        right: ["right-[24px]"],
      },
      disabled: {
        true: ["opacity-0", "pointer-events-none"],
        false: [],
      },
    },
    defaultVariants: { side: 'left', disabled: false },
  }
)

// Count badge: top-left "1 / 5" pill (antd shows the count opposite the close).
const imagePreviewCountVariants = cva(
  [
    "absolute", "top-[24px]", "left-[24px]",
    "inline-flex", "items-center", "justify-center",
    "h-[28px]", "px-[10px]", "rounded-full",
    "text-[14px]", "text-white", "select-none",
    "bg-black/30",
  ],
  { variants: {}, defaultVariants: {} }
)

export const imageWrapperClass = (variants: VariantProps<typeof imageWrapperVariants>) =>
  twMerge(imageWrapperVariants(variants))
export const imageImgClass = (variants: VariantProps<typeof imageImgVariants>) =>
  twMerge(imageImgVariants(variants))
export const imagePlaceholderClass = (variants: VariantProps<typeof imagePlaceholderVariants>) =>
  twMerge(imagePlaceholderVariants(variants))
export const imageErrorClass = (variants: VariantProps<typeof imageErrorVariants>) =>
  twMerge(imageErrorVariants(variants))
export const imageMaskClass = (variants: VariantProps<typeof imageMaskVariants>) =>
  twMerge(imageMaskVariants(variants))
export const imagePreviewClass = (variants: VariantProps<typeof imagePreviewVariants>) =>
  twMerge(imagePreviewVariants(variants))
export const imagePreviewImgClass = (variants: VariantProps<typeof imagePreviewImgVariants>) =>
  twMerge(imagePreviewImgVariants(variants))
export const imagePreviewToolbarClass = (variants: VariantProps<typeof imagePreviewToolbarVariants>) =>
  twMerge(imagePreviewToolbarVariants(variants))
export const imagePreviewOpClass = (variants: VariantProps<typeof imagePreviewOpVariants>) =>
  twMerge(imagePreviewOpVariants(variants))
export const imagePreviewCloseClass = (variants: VariantProps<typeof imagePreviewCloseVariants>) =>
  twMerge(imagePreviewCloseVariants(variants))
export const imagePreviewArrowClass = (variants: VariantProps<typeof imagePreviewArrowVariants>) =>
  twMerge(imagePreviewArrowVariants(variants))
export const imagePreviewCountClass = (variants: VariantProps<typeof imagePreviewCountVariants>) =>
  twMerge(imagePreviewCountVariants(variants))

export const IMAGE_ERROR_ICON = 'i-mdi-image-broken-variant'
export const IMAGE_MASK_ICON = 'i-mdi-eye-outline'
export const IMAGE_ZOOM_IN_ICON = 'i-mdi-magnify-plus-outline'
export const IMAGE_ZOOM_OUT_ICON = 'i-mdi-magnify-minus-outline'
export const IMAGE_ROTATE_LEFT_ICON = 'i-mdi-rotate-left'
export const IMAGE_ROTATE_RIGHT_ICON = 'i-mdi-rotate-right'
export const IMAGE_CLOSE_ICON = 'i-mdi-close'
export const IMAGE_CHEVRON_LEFT_ICON = 'i-mdi-chevron-left'
export const IMAGE_CHEVRON_RIGHT_ICON = 'i-mdi-chevron-right'
