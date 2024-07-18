// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const buttonVariants = cva(
  [
    "peer", "btn", "peer-[.btn]:ms-1.5",
    "border", "border-solid",
    "text-center",
    "transition", "duration-100"
  ],
  {
    variants: {
      type: {
        primary: ["text-white", "bg-primary", "border-primary", "hover:bg-white"],
        secondary: ["text-black ", "bg-white", "border-black", "hover:text-primary", "hover:border-primary"],
        danger: ["text-white", "bg-error", "border-black"],
        link: ["text-link", "bg-transparent", "border-none"],
        text: ["text-black", "bg-transparent", "border-none"],
        dashed: ["text-black", "border-dashed", "bg-transparent", "border-black"]
      },
      size: {
        small: ["px-4", "py-0.85", "text-sm"],
        medium: ["px-5", "py-1", "text-base"],
        large: ["px-6", "py-1.15", "text-lg"],
      },
      shape: {
        rounded: ["rounded-md"],
        square: ["rounded-none"],
        circle: ["rounded-full"],
      },
      disabled: {
        true: ["opacity-50", "cursor-not-allowed"],
        false: ["cursor-pointer"],
      },
      block: {
        true: ["block", "w-full"],
        false: ["inline-block"],
      }
    },
    // compoundVariants: [
    //   {
    //     type: ["primary", "secondary", "danger"],
    //     disabled: false,
    //     class: [''],
    //   },
    // ],
    defaultVariants: {
      type: "primary",
      disabled: false,
      size: 'medium',
      shape: 'rounded',
      block: false
    },
  });

export interface ButtonVariants extends VariantProps<typeof buttonVariants> { }

export const buttonClass = (variants: ButtonVariants) =>
  twMerge(buttonVariants(variants));
