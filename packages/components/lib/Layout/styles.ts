// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const layoutVariants = cva(
  ["flex", "flex-auto", "min-h-0"],
  {
    variants: {
      direction: {
        horizontal: ["flex-row"],
        vertical: ["flex-col"],
      },
    },
    defaultVariants: { direction: "vertical" },
  }
);

const headerVariants = cva(
  ["flex", "items-center", "h-[64px]", "px-lg", "shrink-0", "bg-surface", "text-on-surface", "border-b", "border-solid", "border-outline-variant"],
  { variants: {}, defaultVariants: {} }
);

const footerVariants = cva(
  ["px-lg", "py-lg", "shrink-0", "bg-surface", "text-on-surface-variant", "border-t", "border-solid", "border-outline-variant"],
  { variants: {}, defaultVariants: {} }
);

const contentVariants = cva(
  ["flex-auto", "min-h-0", "bg-surface-variant/40"],
  { variants: {}, defaultVariants: {} }
);

const siderVariants = cva(
  ["relative", "shrink-0", "transition-upthrust", "overflow-hidden"],
  {
    variants: {
      theme: {
        dark: ["bg-inverse-surface", "text-inverse-on-surface"],
        light: ["bg-surface-variant", "text-on-surface", "border-r", "border-solid", "border-outline-variant"],
      },
    },
    defaultVariants: { theme: "dark" },
  }
);

const siderTriggerVariants = cva(
  [
    "absolute", "bottom-0", "left-0", "right-0", "h-[48px]",
    "flex", "items-center", "justify-center", "cursor-pointer",
    "border-t", "border-solid",
    "transition-upthrust-fast",
  ],
  {
    variants: {
      theme: {
        dark: [
          "border-inverse-on-surface/15",
          "bg-inverse-on-surface/8", "hover:bg-inverse-on-surface/15",
          "text-inverse-on-surface", "hover:text-inverse-on-surface",
        ],
        light: [
          "border-outline-variant/30",
          "bg-surface-variant/20", "hover:bg-surface-variant/40",
          "text-on-surface-variant", "hover:text-on-surface",
        ],
      },
    },
    defaultVariants: { theme: "dark" },
  }
);

export type LayoutStyleVariants = VariantProps<typeof layoutVariants>;
export type SiderTheme = NonNullable<VariantProps<typeof siderVariants>['theme']>
export const layoutClass = (variants: VariantProps<typeof layoutVariants>) => twMerge(layoutVariants(variants));
export const headerClass = (variants: VariantProps<typeof headerVariants>) => twMerge(headerVariants(variants));
export const footerClass = (variants: VariantProps<typeof footerVariants>) => twMerge(footerVariants(variants));
export const contentClass = (variants: VariantProps<typeof contentVariants>) => twMerge(contentVariants(variants));
export const siderClass = (variants: VariantProps<typeof siderVariants>) => twMerge(siderVariants(variants));
export const siderTriggerClass = (variants: VariantProps<typeof siderTriggerVariants>) => twMerge(siderTriggerVariants(variants));
