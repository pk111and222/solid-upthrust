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
        primary: ["text-white", "bg-primary", "border-primary", "hover:focus:bg-primary-container", "hover:focus:border-primary-container"],
        default: ["text-primary", "bg-white", "border-primary", "hover:focus:border-primary-container", "text-primary-container"],
        danger: ["text-white", "bg-error", "border-black", "hover:focus:bg-on-error-container", "hover:focus:border-on-error-container"],
        link: ["text-primary", "bg-transparent", "border-none", "hover:focus:text-primary-container", "hover:focus:border-primary-container"],
        text: ["text-gray-900	", "bg-transparent", "border-none", "hover:focus:text-gray-950"],
        dashed: ["text-primary", "border-dashed", "bg-transparent", "border-primary", "hover:focus:text-primary-container", "hover:focus:border-primary-container"]
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
        true: ["opacity-50", "cursor-not-allowed", "pointer-events-none"],
        false: ["cursor-pointer"],
      },
      block: {
        true: ["block", "w-full"],
        false: ["inline-block"],
      },
      loading: {
        true: ["pointer-events-none", "opacity-50"],
        false: ["pointer-events-auto"],
      },
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

// export interface ButtonVariants extends VariantProps<typeof buttonVariants> { }

export const buttonClass = (variants: VariantProps<typeof buttonVariants>) => twMerge(buttonVariants(variants));
