// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { mergeClass } from "../../common/merge";

// Root: fixed full-screen layer; hidden (keep-alive) after the leave animation.
const modalRootVariants = cva(["fixed", "inset-0"], {
  variants: {
    hidden: { true: ["hidden"], false: [] },
  },
  defaultVariants: { hidden: false },
})

// Mask: antd colorBgMask rgba(0,0,0,.45); `blur` adds backdrop-filter blur(4px).
const modalMaskVariants = cva(
  ["fixed", "inset-0", "bg-black/45", "transition-opacity", "duration-slow", "ease-upthrust"],
  {
    variants: {
      visible: {
        true: ["opacity-100"],
        false: ["opacity-0"],
      },
      blur: { true: ["backdrop-blur-[4px]"], false: [] },
    },
    defaultVariants: { visible: false, blur: false },
  }
)

// Wrapper: full-screen scroll region (antd .ant-modal-wrap).
const modalWrapperVariants = cva(
  ["fixed", "inset-0", "overflow-auto", "outline-none"],
  {
    variants: {
      visible: {
        true: [],
        false: ["pointer-events-none"],
      },
      centered: {
        true: ["flex", "items-center", "justify-center", "py-lg"],
        false: [],
      },
    },
    defaultVariants: { visible: false, centered: false },
  }
)

// Panel (antd .ant-modal): 100px from the top, zoom + fade from scale .2.
// Below sm the side margins shrink to 8px (antd max-width calc(100vw - 16px)).
const modalPanelVariants = cva(
  [
    "relative", "mx-auto", "w-full", "outline-none", "text-[14px]", "text-on-surface", "leading-[1.5714]",
    "max-w-[calc(100vw-32px)]", "max-sm:max-w-[calc(100vw-16px)]",
    "transition-overlay", "duration-slow", "ease-upthrust",
  ],
  {
    variants: {
      visible: {
        true: ["opacity-100", "scale-100"],
        false: ["opacity-0", "scale-[0.2]"],
      },
      centered: {
        true: [],
        false: ["top-[100px]", "pb-lg", "max-sm:mx-xs"],
      },
    },
    defaultVariants: { visible: false, centered: false },
  }
)

// Container (antd .ant-modal-container): elevated surface, 20px 24px padding.
const modalContainerVariants = cva(
  ["relative", "bg-surface", "rounded-lg", "shadow", "py-[20px]", "px-lg", "bg-clip-padding"],
  { variants: {}, defaultVariants: {} }
)

// Header: 8px above the body; reserve the close button lane when closable.
const modalHeaderVariants = cva(["mb-xs"], {
  variants: {
    closable: { true: ["pr-[28px]"], false: [] },
  },
  defaultVariants: { closable: false },
})

const modalTitleVariants = cva(
  ["m-0", "text-[16px]", "font-semibold", "text-on-surface", "leading-[1.5]", "break-words"],
  { variants: {}, defaultVariants: {} }
)

// Body: no padding in the non-wireframe theme.
const modalBodyVariants = cva(["break-words"], { variants: {}, defaultVariants: {} })

// Footer: 12px above, right-aligned buttons 8px apart.
const modalFooterVariants = cva(
  ["mt-sm", "flex", "flex-wrap", "justify-end", "gap-xs"],
  { variants: {}, defaultVariants: {} }
)

// Close: 32px square, 12px from the container corner ((56 - 32) / 2).
// The glyph is a CHILD element, so the hover bg never hides a mask icon.
const modalCloseVariants = cva(
  [
    "absolute", "top-[12px]", "right-[12px]", "z-1",
    "inline-flex", "items-center", "justify-center", "p-0",
    "w-[32px]", "h-[32px]", "text-[16px]", "leading-none",
    "text-on-surface-variant", "bg-transparent", "cursor-pointer", "border-none",
    "rounded-sm", "outline-none", "transition-upthrust",
    "hover:text-on-surface", "hover:bg-on-surface/6",
    "focus-visible:outline-2", "focus-visible:outline-solid", "focus-visible:outline-primary/30",
  ],
  {
    variants: {
      disabled: { true: ["cursor-not-allowed", "opacity-25", "hover:bg-transparent"], false: [] },
    },
    defaultVariants: { disabled: false },
  }
)

export const modalRootClass = (variants: VariantProps<typeof modalRootVariants>) => mergeClass(modalRootVariants(variants))
export const modalMaskClass = (variants: VariantProps<typeof modalMaskVariants>) => mergeClass(modalMaskVariants(variants))
export const modalWrapperClass = (variants: VariantProps<typeof modalWrapperVariants>) => mergeClass(modalWrapperVariants(variants))
export const modalPanelClass = (variants: VariantProps<typeof modalPanelVariants>) => mergeClass(modalPanelVariants(variants))
export const modalContainerClass = (variants: VariantProps<typeof modalContainerVariants>) => mergeClass(modalContainerVariants(variants))
export const modalHeaderClass = (variants: VariantProps<typeof modalHeaderVariants>) => mergeClass(modalHeaderVariants(variants))
export const modalTitleClass = (variants: VariantProps<typeof modalTitleVariants>) => mergeClass(modalTitleVariants(variants))
export const modalBodyClass = (variants: VariantProps<typeof modalBodyVariants>) => mergeClass(modalBodyVariants(variants))
export const modalFooterClass = (variants: VariantProps<typeof modalFooterVariants>) => mergeClass(modalFooterVariants(variants))
export const modalCloseClass = (variants: VariantProps<typeof modalCloseVariants>) => mergeClass(modalCloseVariants(variants))

/** Every variant combination, for dead-class tests. */
export const modalClassMatrix = (): string[] => {
  const out: string[] = []
  for (const b of [true, false]) {
    out.push(modalRootClass({ hidden: b }), modalWrapperClass({ visible: b, centered: b }), modalHeaderClass({ closable: b }),
      modalCloseClass({ disabled: b }))
    for (const c of [true, false]) out.push(modalMaskClass({ visible: b, blur: c }), modalPanelClass({ visible: b, centered: c }))
  }
  out.push(modalContainerClass({}), modalTitleClass({}), modalBodyClass({}), modalFooterClass({}))
  return out
}
