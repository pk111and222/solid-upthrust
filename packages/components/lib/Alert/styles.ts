// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const alertContainerVariants = cva(
  [
    "relative", "flex", "items-start", "break-words",
    "border", "border-solid", "transition-upthrust",
  ],
  {
    variants: {
      type: {
        success: ["bg-[#f6ffed]", "border-[#b7eb8f]"],
        info: ["bg-primary-container/15", "border-primary/30"],
        warning: ["bg-[#fffbe6]", "border-[#ffe58f]"],
        error: ["bg-[#fff2f0]", "border-[#ffccc7]"],
      },
      hasDescription: {
        true: ["py-[20px]", "px-[24px]", "rounded-lg"],
        false: ["py-[8px]", "px-[12px]", "rounded-lg"],
      },
      banner: {
        true: ["!rounded-none", "border-x-0", "border-t-0"],
        false: [],
      },
    },
    defaultVariants: {
      type: "info",
      hasDescription: false,
      banner: false,
    },
  }
);

const alertIconVariants = cva(
  ["shrink-0", "mr-[8px]"],
  {
    variants: {
      type: {
        success: ["text-[#52c41a]", "i-mdi-check-circle"],
        info: ["text-primary", "i-mdi-information"],
        warning: ["text-[#faad14]", "i-mdi-alert"],
        error: ["text-error", "i-mdi-close-circle"],
      },
      hasDescription: {
        true: ["text-[24px]", "mt-[1px]"],
        false: ["text-[16px]", "mt-[1px]"],
      },
    },
    defaultVariants: {
      type: "info",
      hasDescription: false,
    },
  }
);

const alertMessageVariants = cva(
  ["text-on-surface"],
  {
    variants: {
      hasDescription: {
        true: ["text-[16px]", "font-medium", "mb-[4px]"],
        false: ["text-[14px]"],
      },
    },
    defaultVariants: { hasDescription: false },
  }
);

const alertDescriptionVariants = cva(
  ["text-[14px]", "text-on-surface-variant", "leading-[1.5714]"],
  { variants: {}, defaultVariants: {} }
);

const alertCloseVariants = cva(
  [
    "absolute", "top-[8px]", "right-[12px]",
    "inline-flex", "items-center", "justify-center",
    "w-[22px]", "h-[22px]",
    "text-on-surface-variant", "cursor-pointer", "border-none", "bg-transparent",
    "rounded-sm", "transition-upthrust-fast",
    "hover:text-on-surface",
  ],
  {
    variants: {
      hasDescription: {
        true: ["top-[20px]", "right-[24px]"],
        false: [],
      },
    },
    defaultVariants: { hasDescription: false },
  }
);

export const alertContainerClass = (variants: VariantProps<typeof alertContainerVariants>) => twMerge(alertContainerVariants(variants));
export const alertIconClass = (variants: VariantProps<typeof alertIconVariants>) => twMerge(alertIconVariants(variants));
export const alertMessageClass = (variants: VariantProps<typeof alertMessageVariants>) => twMerge(alertMessageVariants(variants));
export const alertDescriptionClass = (variants: VariantProps<typeof alertDescriptionVariants>) => twMerge(alertDescriptionVariants(variants));
export const alertCloseClass = (variants: VariantProps<typeof alertCloseVariants>) => twMerge(alertCloseVariants(variants));
