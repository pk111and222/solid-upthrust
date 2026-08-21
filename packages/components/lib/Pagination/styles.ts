// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const paginationContainerVariants = cva(
  ["flex", "items-center", "gap-[8px]", "text-[14px]"],
  {
    variants: {
      align: {
        start: ["justify-start"],
        center: ["justify-center"],
        end: ["justify-end"],
      },
    },
    defaultVariants: { align: "start" },
  }
);

// Merged active × disabled variant keys — no compoundVariants with visual
// classes (UnoCSS static scanning can't extract them). Disabled beats active:
// an active-but-disabled page shows the subdued token set.
const paginationItemVariants = cva(
  [
    "flex", "items-center", "justify-center", "rounded", "cursor-pointer",
    "transition-upthrust-fast", "select-none", "outline-none",
    "border", "border-outline", "bg-surface",
  ],
  {
    variants: {
      state: {
        idle: ["text-on-surface", "hover:border-primary", "hover:text-primary"],
        active: ["bg-primary", "text-on-primary", "border-primary", "font-medium"],
        "active-disabled": ["bg-primary/25", "text-on-primary/60", "border-primary/25"],
        "nav-disabled": ["text-on-surface/25", "border-outline/50", "bg-surface"],
      },
      size: {
        default: ["w-[32px]", "h-[32px]", "text-[14px]"],
        small: ["w-[24px]", "h-[24px]", "text-[12px]"],
      },
    },
    defaultVariants: { state: "idle", size: "default" },
  }
);

const paginationEllipsisVariants = cva(
  [
    // The icon renders via background-color:currentColor under a mask, so
    // NO bg-* utility may live on this element — bg-transparent here
    // previously defeated the icon's background and left the slot blank.
    "flex", "items-center", "justify-center",
    "text-on-surface-variant", "select-none",
    // Icon must live here (scannable cva literal) — the same class in
    // index.tsx's <Show fallback> JSX was intermittently NOT extracted by
    // the UnoCSS pipeline.
    "i-mdi-dots-horizontal",
  ],
  {
    variants: {
      size: {
        default: ["w-[32px]", "h-[32px]", "text-[14px]"],
        small: ["w-[24px]", "h-[24px]", "text-[12px]"],
      },
    },
    defaultVariants: { size: "default" },
  }
);

const paginationJumperVariants = cva(
  [
    "rounded", "border", "border-outline", "text-center", "outline-none",
    "transition-upthrust-fast", "focus:border-primary", "text-on-surface",
    "bg-surface",
  ],
  {
    variants: {
      size: {
        default: ["h-[32px]", "w-[50px]", "text-[14px]"],
        small: ["h-[24px]", "w-[40px]", "text-[12px]"],
      },
      disabled: {
        true: ["opacity-40", "cursor-not-allowed", "bg-surface"],
        false: [],
      },
    },
    defaultVariants: { size: "default", disabled: false },
  }
);

const paginationTotalVariants = cva(
  ["text-[14px]", "text-on-surface-variant", "mr-[8px]"],
  { variants: {}, defaultVariants: {} }
);

// "10 条/页" size-changer trigger button.
const paginationSizeChangerVariants = cva(
  [
    "inline-flex", "items-center", "justify-center", "gap-[4px]",
    "rounded", "border", "border-outline", "bg-surface", "text-on-surface",
    "cursor-pointer", "transition-upthrust-fast", "outline-none",
    "hover:border-primary", "hover:text-primary", "select-none",
  ],
  {
    variants: {
      size: {
        default: ["h-[32px]", "px-[8px]", "text-[14px]"],
        small: ["h-[24px]", "px-[6px]", "text-[12px]"],
      },
      disabled: {
        true: ["text-on-surface/25", "border-outline/50", "cursor-not-allowed", "pointer-events-none"],
        false: [],
      },
    },
    defaultVariants: { size: "default", disabled: false },
  }
);

export const paginationContainerClass = (variants: VariantProps<typeof paginationContainerVariants>) => twMerge(paginationContainerVariants(variants));
export const paginationItemClass = (variants: VariantProps<typeof paginationItemVariants>) => twMerge(paginationItemVariants(variants));
export const paginationEllipsisClass = (variants: VariantProps<typeof paginationEllipsisVariants>) => twMerge(paginationEllipsisVariants(variants));
export const paginationJumperClass = (variants: VariantProps<typeof paginationJumperVariants>) => twMerge(paginationJumperVariants(variants));
export const paginationTotalClass = (variants: VariantProps<typeof paginationTotalVariants>) => twMerge(paginationTotalVariants(variants));
export const paginationSizeChangerClass = (variants: VariantProps<typeof paginationSizeChangerVariants>) => twMerge(paginationSizeChangerVariants(variants));
