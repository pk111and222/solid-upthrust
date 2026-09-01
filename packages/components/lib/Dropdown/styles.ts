// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Dropdown overlay: 8px radius, standard shadow, subtle scale+fade in.
// Only opacity/scale transition — NEVER top/left. createTrigger re-positions
// the layer on open/scroll/resize; `transition-all` would animate those
// position changes and make the overlay visibly fly across the screen.
const dropdownOverlayVariants = cva(
  [
    "bg-surface", "rounded-lg", "shadow", "py-1", "min-w-[120px]",
    "transition-overlay", "duration-fast", "ease-upthrust", "origin-top",
    "outline-none",
  ],
  {
    variants: {
      visible: {
        true: ["opacity-100", "scale-100"],
        false: ["opacity-0", "scale-95", "pointer-events-none"],
      },
      placement: {
        bottomLeft: ["origin-top-left"],
        bottomRight: ["origin-top-right"],
        bottom: ["origin-top"],
        topLeft: ["origin-bottom-left"],
        topRight: ["origin-bottom-right"],
        top: ["origin-bottom"],
        leftTop: ["origin-top-right"],
        leftBottom: ["origin-bottom-right"],
        left: ["origin-right"],
        rightTop: ["origin-top-left"],
        rightBottom: ["origin-bottom-left"],
        right: ["origin-left"],
      },
    },
    defaultVariants: { visible: false, placement: "bottomLeft" },
  }
);

const dropdownItemVariants = cva(
  [
    "flex", "items-center", "px-[12px]", "py-[5px]", "text-[14px]",
    "cursor-pointer", "transition-upthrust-fast", "gap-2", "text-on-surface",
    "hover:bg-on-surface/6", "outline-none",
  ],
  {
    variants: {
      disabled: {
        true: ["opacity-40", "cursor-not-allowed", "pointer-events-none", "hover:bg-transparent"],
        false: [],
      },
      danger: {
        true: ["text-error", "hover:bg-error/10"],
        false: [],
      },
      // Keyboard focus ring — visible when navigating with arrows/Tab.
      focused: {
        true: ["bg-on-surface/6", "outline-none"],
        false: [],
      },
    },
    // Merged danger × disabled beats compound: danger disabled keeps error
    // text at reduced opacity, no hover background.
    compoundVariants: [
      { danger: true, disabled: true, class: ["hover:bg-transparent"] },
    ],
    defaultVariants: { disabled: false, danger: false, focused: false },
  }
);

const dropdownDividerVariants = cva(
  ["border-t", "border-outline-variant", "my-1", "mx-2"],
  { variants: {}, defaultVariants: {} }
);

export const dropdownOverlayClass = (variants: VariantProps<typeof dropdownOverlayVariants>) => twMerge(dropdownOverlayVariants(variants));
export const dropdownItemClass = (variants: VariantProps<typeof dropdownItemVariants>) => twMerge(dropdownItemVariants(variants));
export const dropdownDividerClass = (variants: VariantProps<typeof dropdownDividerVariants>) => twMerge(dropdownDividerVariants(variants));
