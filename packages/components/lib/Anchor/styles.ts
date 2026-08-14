// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const anchorContainerVariants = cva(
  ["relative"],
  {
    variants: {
      direction: {
        vertical: ["border-l-2", "border-outline/20", "pl-0"],
        horizontal: ["flex", "items-center", "gap-4", "border-b-2", "border-outline/20", "pb-0"],
      },
    },
    defaultVariants: { direction: "vertical" },
  }
);

const anchorLinkVariants = cva(
  ["block", "py-1", "text-sm", "transition-colors", "cursor-pointer", "no-underline"],
  {
    variants: {
      active: {
        true: ["text-primary", "font-medium"],
        false: ["text-on-surface-variant", "hover:text-primary"],
      },
      direction: {
        vertical: ["pl-4", "border-l-2", "border-transparent", "-ml-[2px]"],
        horizontal: ["pb-2", "border-b-2", "border-transparent", "-mb-[2px]"],
      },
    },
    compoundVariants: [
      { active: true, direction: "vertical", class: ["border-l-primary"] },
      { active: true, direction: "horizontal", class: ["border-b-primary"] },
    ],
    defaultVariants: { active: false, direction: "vertical" },
  }
);

export const anchorContainerClass = (variants: VariantProps<typeof anchorContainerVariants>) => twMerge(anchorContainerVariants(variants));
export const anchorLinkClass = (variants: VariantProps<typeof anchorLinkVariants>) => twMerge(anchorLinkVariants(variants));
