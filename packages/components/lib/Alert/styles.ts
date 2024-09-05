// @unocss-include
import { cva, type VariantProps } from "class-variance-authority";
import { classCreate } from 'utils/styles'

// alert contanier
export const alertClass = classCreate(cva(
  [
    "alert", "border", "border-solid", "transition", "duration-100", "relative", "break-words"
  ],
  {
    variants: {
      type: {
        primary: ["text-on-primary-container", "bg-primary-container", "border-primary"],
        default: [],
        danger: [],
        dashed: [],
      },
      size: {
        small: ["px-4", "py-0.85", "text-sm"],
        medium: ["px-5", "py-1", "text-base"],
        large: ["px-6", "py-1.15", "text-lg"],
      },
      banner: {
        true: [""],
        false: ["rounded-lg"]
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
      size: 'medium',
    },
  }));

// message
export const alertMessageClass = classCreate(cva(
  [],
  {
    variants: {
      type: {
        primary: ["text-white", "bg-primary", "border-primary", "hover:focus:bg-primary-container", "hover:focus:border-primary-container"],
        default: ["text-primary", "bg-white", "border-primary", "hover:focus:border-primary-container", "text-primary-container"],
        danger: ["text-white", "bg-error", "border-black", "hover:focus:bg-on-error-container", "hover:focus:border-on-error-container"],
        dashed: ["text-primary", "bg-white", "border-dashed", "border-primary", "hover:focus:border-primary-container"],
      },
      size: {
        small: ["px-4", "py-0.85", "text-sm"],
        medium: ["px-5", "py-1", "text-base"],
        large: ["px-6", "py-1.15", "text-lg"],
      },
    },
    defaultVariants: {
      type: "primary",
      size: 'medium',
    },
  }));

// description
export const alertDescClass = classCreate(cva(
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
        dashed: ["text-primary", "bg-white", "border-dashed", "border-primary", "hover:focus:border-primary-container"],
      },
      size: {
        small: ["px-4", "py-0.85", "text-sm"],
        medium: ["px-5", "py-1", "text-base"],
        large: ["px-6", "py-1.15", "text-lg"],
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
      size: 'medium',
    },
  }));

// icon
export const alertIconClass = classCreate(cva(
  [],
  {
    variants: {
      type: {
        'info': ['i-mdi-alert-circle'],
        'success': ['i-mdi-check-circle'],
        'warning': ['i-mdi-alarm-light'],
        'error': ['i-mdi-close-circle'],
        'wait': ['i-mdi-clock'],
      },
      size: {
        small: ["text-sm"],
        medium: ["text-base"],
        large: ["text-lg"],
      },
    },
    defaultVariants: {
      type: "info",
      size: 'medium',
    },
  }));