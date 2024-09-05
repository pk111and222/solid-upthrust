import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export const classCreate = <T extends (...args: any) => any>(cvaClass: T) => {
  return (v: VariantProps<T>) => twMerge(cvaClass(v))
}
