import { VariantProps } from 'class-variance-authority';
declare const layoutVariants: (props?: ({
    direction?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const headerVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const footerVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const contentVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const siderVariants: (props?: ({
    theme?: "dark" | "light" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const siderTriggerVariants: (props?: ({
    theme?: "dark" | "light" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export type LayoutStyleVariants = VariantProps<typeof layoutVariants>;
export type SiderTheme = NonNullable<VariantProps<typeof siderVariants>['theme']>;
export declare const layoutClass: (variants: VariantProps<typeof layoutVariants>) => string;
export declare const headerClass: (variants: VariantProps<typeof headerVariants>) => string;
export declare const footerClass: (variants: VariantProps<typeof footerVariants>) => string;
export declare const contentClass: (variants: VariantProps<typeof contentVariants>) => string;
export declare const siderClass: (variants: VariantProps<typeof siderVariants>) => string;
export declare const siderTriggerClass: (variants: VariantProps<typeof siderTriggerVariants>) => string;
export {};
