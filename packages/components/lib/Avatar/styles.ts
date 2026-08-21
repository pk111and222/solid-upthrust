// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Avatar sizes: large 64px / default(middle) 40px / small 28px.
// Numeric/string sizes are handled inline in index.tsx (dynamic style).
const avatarVariants = cva(
  ["relative", "inline-flex", "items-center", "justify-center", "select-none",
   "overflow-hidden", "text-on-primary", "shrink-0"],
  {
    variants: {
      shape: {
        circle: ["rounded-full"],
        square: ["rounded-lg"],
      },
      // merged size key — background + font scale per size
      size: {
        "large": ["bg-primary", "text-[28px]"],
        "middle": ["bg-primary", "text-[18px]"],
        "small": ["bg-primary", "text-[14px]"],
      },
      customColor: {
        // when a color prop is set, bg is inline — base class must not fight it
        true: ["bg-transparent"],
        false: [],
      },
    },
    defaultVariants: { shape: "circle", size: "middle", customColor: false },
  }
);

// AvatarGroup: the container rows avatars with negative margin overlap.
// `--avatar-overlap` is set inline from maxCountPopoverTrigger math in index.tsx.
const avatarGroupVariants = cva(
  ["inline-flex", "items-center"],
  { variants: {}, defaultVariants: {} }
);

// The stacked sibling style (applied to all but the first avatar).
const avatarGroupItemVariants = cva(
  ["border-2", "border-solid", "border-surface"],
  {
    variants: {
      shape: {
        circle: ["rounded-full"],
        square: ["rounded-lg"],
      },
    },
    defaultVariants: { shape: "circle" },
  }
);

// The "+N" overflow indicator pill.
const avatarGroupMoreVariants = cva(
  ["relative", "z-1", "border-2", "border-solid", "border-surface", "bg-surface-variant",
   "text-on-surface-variant", "flex", "items-center", "justify-center",
   "shrink-0"],
  {
    variants: {
      shape: {
        circle: ["rounded-full"],
        square: ["rounded-lg"],
      },
    },
    defaultVariants: { shape: "circle" },
  }
);

export const avatarClass = (variants: VariantProps<typeof avatarVariants>) => twMerge(avatarVariants(variants));
export const avatarGroupClass = (variants: VariantProps<typeof avatarGroupVariants>) => twMerge(avatarGroupVariants(variants));
export const avatarGroupItemClass = (variants: VariantProps<typeof avatarGroupItemVariants>) => twMerge(avatarGroupItemVariants(variants));
export const avatarGroupMoreClass = (variants: VariantProps<typeof avatarGroupMoreVariants>) => twMerge(avatarGroupMoreVariants(variants));
