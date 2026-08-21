import { VariantProps } from 'class-variance-authority';
export declare const classCreate: <T extends (...args: any) => any>(cvaClass: T) => (v: VariantProps<T>) => string;
