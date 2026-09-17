// @unocss-include
import { twMerge } from "tailwind-merge";

/**
 * Mentions styles — the editor is the TextArea frame family; the dropdown
 * is the Dropdown overlay family. antd renders the textarea with a padding
 * matching Input's TextArea and the mention menu anchored at the caret
 * (createTrigger anchors to the textarea box — bottomLeft, antd's fallback
 * positioning when caret measurement is off).
 */
import { cva, type VariantProps } from "class-variance-authority";

const mentionsDropdownVariants = cva(
  [
    "bg-surface", "rounded-lg", "shadow", "py-[4px]",
    "min-w-[120px]", "max-h-[264px]", "overflow-y-auto",
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
  },
);

export const mentionsDropdownClass = (variants: VariantProps<typeof mentionsDropdownVariants>) =>
  twMerge(mentionsDropdownVariants(variants));

/** One suggestion row (same family as AutoComplete's). */
export const mentionsOptionClass = cva(
  [
    "flex", "items-center", "gap-[8px]",
    "px-[12px]", "py-[5px]", "text-[14px]",
    "cursor-pointer", "transition-upthrust-fast", "text-on-surface",
    "outline-none", "whitespace-nowrap",
  ],
  {
    variants: {
      active: { true: ["bg-on-surface/6"], false: ["hover:bg-on-surface/6"] },
      disabled: {
        true: ["!text-on-surface/25", "cursor-not-allowed", "pointer-events-none", "hover:bg-transparent"],
        false: [],
      },
    },
    defaultVariants: { active: false, disabled: false },
  },
);

export const mentionsOptionWrapClass = (variants: VariantProps<typeof mentionsOptionClass>) =>
  twMerge(mentionsOptionClass(variants));

/** Avatar-ish glyph placeholder inside a suggestion row (antd shows an avatar). */
export const mentionsOptionAvatarClass = () =>
  twMerge([
    "flex", "items-center", "justify-center",
    "h-[20px]", "w-[20px]", "rounded-full",
    "bg-on-surface/6", "text-[10px]", "text-on-surface-variant",
    "shrink-0", "select-none",
  ]);

/** Empty block. */
export const mentionsEmptyClass = () =>
  twMerge([
    "flex", "items-center", "justify-center",
    "py-[12px]", "px-[12px]", "text-[14px]", "text-on-surface/25", "select-none",
  ]);
