// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const stepsContainerVariants = cva(
  ["flex", "gap-0"],
  {
    variants: {
      direction: {
        horizontal: ["flex-row", "items-start"],
        vertical: ["flex-col"],
      },
    },
    defaultVariants: { direction: "horizontal" },
  }
);

const stepItemVariants = cva(
  ["flex", "items-start", "relative"],
  {
    variants: {
      direction: {
        horizontal: ["flex-1"],
        vertical: ["pb-6"],
      },
    },
    defaultVariants: { direction: "horizontal" },
  }
);

const stepIconVariants = cva(
  ["w-8", "h-8", "rounded-full", "flex", "items-center", "justify-center", "text-sm", "font-medium", "shrink-0", "border-2", "transition-colors"],
  {
    variants: {
      status: {
        finish: ["bg-primary", "border-primary", "text-on-primary"],
        process: ["bg-primary", "border-primary", "text-on-primary"],
        wait: ["bg-surface", "border-outline/40", "text-on-surface-variant"],
        error: ["bg-error", "border-error", "text-on-error"],
      },
      size: {
        default: ["w-8", "h-8", "text-sm"],
        small: ["w-6", "h-6", "text-xs"],
      },
    },
    defaultVariants: { status: "wait", size: "default" },
  }
);

const stepConnectorVariants = cva(
  ["transition-colors"],
  {
    variants: {
      status: {
        finish: ["bg-primary"],
        process: ["bg-outline/30"],
        wait: ["bg-outline/30"],
        error: ["bg-outline/30"],
      },
      direction: {
        horizontal: ["h-0.5", "flex-1", "mx-2", "mt-4"],
        vertical: ["w-0.5", "ml-4", "my-1", "min-h-6"],
      },
    },
    defaultVariants: { status: "wait", direction: "horizontal" },
  }
);

const stepTitleVariants = cva(
  ["text-sm", "transition-colors"],
  {
    variants: {
      status: {
        finish: ["text-on-surface"],
        process: ["text-on-surface", "font-medium"],
        wait: ["text-on-surface-variant"],
        error: ["text-error"],
      },
    },
    defaultVariants: { status: "wait" },
  }
);

const stepDescriptionVariants = cva(
  ["text-xs", "mt-1"],
  {
    variants: {
      status: {
        finish: ["text-on-surface-variant"],
        process: ["text-on-surface-variant"],
        wait: ["text-on-surface-variant/60"],
        error: ["text-error/80"],
      },
    },
    defaultVariants: { status: "wait" },
  }
);

export const stepsContainerClass = (variants: VariantProps<typeof stepsContainerVariants>) => twMerge(stepsContainerVariants(variants));
export const stepItemClass = (variants: VariantProps<typeof stepItemVariants>) => twMerge(stepItemVariants(variants));
export const stepIconClass = (variants: VariantProps<typeof stepIconVariants>) => twMerge(stepIconVariants(variants));
export const stepConnectorClass = (variants: VariantProps<typeof stepConnectorVariants>) => twMerge(stepConnectorVariants(variants));
export const stepTitleClass = (variants: VariantProps<typeof stepTitleVariants>) => twMerge(stepTitleVariants(variants));
export const stepDescriptionClass = (variants: VariantProps<typeof stepDescriptionVariants>) => twMerge(stepDescriptionVariants(variants));
