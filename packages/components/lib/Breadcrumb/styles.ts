// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const breadcrumbVariants = cva(
  ["flex", "items-center", "flex-wrap", "text-sm"],
  { variants: {}, defaultVariants: {} }
);

const breadcrumbItemVariants = cva(
  ["inline-flex", "items-center", "transition-colors"],
  {
    variants: {
      active: {
        true: ["text-on-surface", "font-medium"],
        false: ["text-on-surface-variant", "hover:text-primary", "cursor-pointer"],
      },
    },
    defaultVariants: { active: false },
  }
);

const breadcrumbSeparatorVariants = cva(
  ["mx-2", "text-outline/50", "select-none"],
  { variants: {}, defaultVariants: {} }
);

export const breadcrumbClass = (variants: VariantProps<typeof breadcrumbVariants>) => twMerge(breadcrumbVariants(variants));
export const breadcrumbItemClass = (variants: VariantProps<typeof breadcrumbItemVariants>) => twMerge(breadcrumbItemVariants(variants));
export const breadcrumbSeparatorClass = (variants: VariantProps<typeof breadcrumbSeparatorVariants>) => twMerge(breadcrumbSeparatorVariants(variants));
