// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const breadcrumbVariants = cva(
  ["flex", "items-center", "flex-wrap", "text-[14px]", "text-on-surface-variant"],
  { variants: {}, defaultVariants: {} }
);

const breadcrumbItemVariants = cva(
  ["inline-flex", "items-center", "transition-upthrust-fast"],
  {
    variants: {
      active: {
        true: ["text-on-surface"],
        false: [],
      },
    },
    defaultVariants: { active: false },
  }
);

const breadcrumbLinkVariants = cva(
  [
    "inline-flex", "items-center", "transition-upthrust-fast",
    "text-on-surface-variant", "hover:text-primary", "cursor-pointer", "no-underline",
  ],
  { variants: {}, defaultVariants: {} }
);

const breadcrumbSeparatorVariants = cva(
  ["mx-[8px]", "text-on-surface/25", "select-none", "text-[14px]"],
  { variants: {}, defaultVariants: {} }
);

export const breadcrumbClass = (variants: VariantProps<typeof breadcrumbVariants>) => twMerge(breadcrumbVariants(variants));
export const breadcrumbItemClass = (variants: VariantProps<typeof breadcrumbItemVariants>) => twMerge(breadcrumbItemVariants(variants));
export const breadcrumbLinkClass = (variants: VariantProps<typeof breadcrumbLinkVariants>) => twMerge(breadcrumbLinkVariants(variants));
export const breadcrumbSeparatorClass = (variants: VariantProps<typeof breadcrumbSeparatorVariants>) => twMerge(breadcrumbSeparatorVariants(variants));
