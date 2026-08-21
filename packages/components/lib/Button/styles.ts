// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const buttonVariants = cva(
  [
    "relative", "inline-flex", "items-center", "justify-center",
    "border", "border-solid",
    "whitespace-nowrap", "select-none",
    "transition-upthrust",
    "focus-visible:outline-2", "focus-visible:outline-offset-1",
  ],
  {
    variants: {
      colorScheme: {
        'solid-primary': ["bg-primary", "text-on-primary", "border-transparent", "hover:bg-primary/85", "active:bg-primary/70", "shadow-[0_2px_0_rgba(0,100,255,0.1)]", "focus-visible:outline-primary/40"],
        'solid-default': ["bg-on-surface/85", "text-surface", "border-transparent", "hover:bg-on-surface/70", "active:bg-on-surface/60", "focus-visible:outline-on-surface/20"],
        'solid-danger': ["bg-error", "text-on-error", "border-transparent", "hover:bg-error/80", "active:bg-error/65", "shadow-[0_2px_0_rgba(255,38,5,0.06)]", "focus-visible:outline-error/40"],
        'outlined-primary': ["bg-surface", "border-primary", "text-primary", "hover:border-primary/70", "hover:text-primary/70", "active:border-primary", "active:text-primary", "focus-visible:outline-primary/40"],
        'outlined-default': ["bg-surface", "border-outline", "text-on-surface", "hover:border-primary", "hover:text-primary", "active:border-primary/80", "active:text-primary/80", "shadow-[0_2px_0_rgba(0,0,0,0.02)]", "focus-visible:outline-primary/40"],
        'outlined-danger': ["bg-surface", "border-error", "text-error", "hover:border-error/70", "hover:text-error/70", "active:border-error", "active:text-error", "focus-visible:outline-error/40"],
        'dashed-primary': ["bg-surface", "border-dashed", "border-primary", "text-primary", "hover:border-primary/70", "hover:text-primary/70", "active:border-primary", "active:text-primary", "focus-visible:outline-primary/40"],
        'dashed-default': ["bg-surface", "border-dashed", "border-outline", "text-on-surface", "hover:border-primary", "hover:text-primary", "active:border-primary/80", "active:text-primary/80", "shadow-[0_2px_0_rgba(0,0,0,0.02)]", "focus-visible:outline-primary/40"],
        'dashed-danger': ["bg-surface", "border-dashed", "border-error", "text-error", "hover:border-error/70", "hover:text-error/70", "active:border-error", "active:text-error", "focus-visible:outline-error/40"],
        'filled-primary': ["bg-primary/10", "text-primary", "border-transparent", "hover:bg-primary/20", "active:bg-primary/30", "focus-visible:outline-primary/40"],
        'filled-default': ["bg-on-surface/4", "text-on-surface", "border-transparent", "hover:bg-on-surface/8", "active:bg-on-surface/12", "focus-visible:outline-on-surface/20"],
        'filled-danger': ["bg-error/8", "text-error", "border-transparent", "hover:bg-error/15", "active:bg-error/25", "focus-visible:outline-error/40"],
        'text-primary': ["bg-transparent", "text-primary", "border-transparent", "hover:bg-primary/6", "active:bg-primary/10"],
        'text-default': ["bg-transparent", "text-on-surface", "border-transparent", "hover:bg-on-surface/6", "active:bg-on-surface/10"],
        'text-danger': ["bg-transparent", "text-error", "border-transparent", "hover:bg-error/6", "active:bg-error/10"],
        'link-primary': ["bg-transparent", "text-primary", "border-transparent", "hover:text-primary/70", "active:text-primary"],
        'link-default': ["bg-transparent", "text-on-surface", "border-transparent", "hover:text-primary", "active:text-primary/80"],
        'link-danger': ["bg-transparent", "text-error", "border-transparent", "hover:text-error/70", "active:text-error"],
      },
      size: {
        small: ["px-[7px]", "h-control-sm", "text-[12px]", "leading-[1.5714]", "gap-[4px]"],
        middle: ["px-[15px]", "h-control", "text-[14px]", "leading-[1.5714]", "gap-[8px]"],
        large: ["px-[15px]", "h-control-lg", "text-[16px]", "leading-[1.5714]", "gap-[8px]"],
      },
      shape: {
        default: ["rounded"],
        round: ["rounded-full"],
        circle: ["rounded-full", "!px-0", "aspect-square", "!gap-0"],
      },
      disabled: {
        true: ["!bg-on-surface/4", "!text-on-surface/25", "!border-on-surface/15", "!shadow-none", "cursor-not-allowed", "pointer-events-none"],
        false: ["cursor-pointer"],
      },
      ghost: {
        true: ["!bg-transparent"],
        false: [],
      },
      block: {
        true: ["flex", "w-full"],
        false: ["inline-flex"],
      },
      loading: {
        true: ["pointer-events-none", "opacity-65"],
        false: [],
      },
    },
    compoundVariants: [
      { ghost: true, colorScheme: 'solid-primary', class: ["!text-primary", "!border-primary"] },
      { ghost: true, colorScheme: 'solid-default', class: ["!text-surface", "!border-surface"] },
      { ghost: true, colorScheme: 'solid-danger', class: ["!text-error", "!border-error"] },
      { ghost: true, colorScheme: 'outlined-primary', class: ["!text-primary", "!border-primary"] },
      { ghost: true, colorScheme: 'outlined-default', class: ["!text-surface", "!border-surface"] },
      { ghost: true, colorScheme: 'outlined-danger', class: ["!text-error", "!border-error"] },
      { ghost: true, colorScheme: 'dashed-primary', class: ["!text-primary", "!border-primary"] },
      { ghost: true, colorScheme: 'dashed-default', class: ["!text-surface", "!border-surface"] },
      { ghost: true, colorScheme: 'dashed-danger', class: ["!text-error", "!border-error"] },
    ],
    defaultVariants: {
      colorScheme: "outlined-default",
      size: "middle",
      shape: "default",
      disabled: false,
      ghost: false,
      block: false,
      loading: false,
    },
  }
);

const waveVariants = cva(
  [
    "absolute", "inset-0", "rounded-[inherit]",
    "animate-wave", "pointer-events-none",
    "opacity-0",
  ],
  {
    variants: {
      active: {
        true: ["opacity-100"],
        false: ["hidden"],
      },
    },
    defaultVariants: { active: false },
  }
);

export type ButtonStyleVariants = VariantProps<typeof buttonVariants>;
export const buttonClass = (variants: ButtonStyleVariants) => twMerge(buttonVariants(variants));
export const waveClass = (variants: VariantProps<typeof waveVariants>) => twMerge(waveVariants(variants));
