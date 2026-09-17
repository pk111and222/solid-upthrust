import { VariantProps } from 'class-variance-authority';
declare const badgeWrapperVariants: (props?: ({
    mode?: "wrapped" | "standalone" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const badgeCountVariants: (props?: ({
    sizeMode?: "middle-wrapped" | "middle-standalone" | "small-wrapped" | "small-standalone" | null | undefined;
    color?: "error" | "warning" | "success" | "primary" | "gray" | "processing" | "custom" | null | undefined;
    words?: boolean | null | undefined;
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const badgeDotVariants: (props?: ({
    mode?: "wrapped" | "standalone" | null | undefined;
    color?: "error" | "warning" | "success" | "primary" | "gray" | "processing" | "custom" | null | undefined;
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const badgeStatusDotVariants: (props?: ({
    status?: "error" | "warning" | "success" | "default" | "gray" | "processing" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const badgeStatusTextVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const ribbonVariants: (props?: ({
    placement?: "start" | "end" | null | undefined;
    color?: "blue" | "gray" | "green" | "red" | "custom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const ribbonContentVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const ribbonWrapperVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const badgeWrapperClass: (variants: VariantProps<typeof badgeWrapperVariants>) => string;
export declare const badgeCountClass: (variants: VariantProps<typeof badgeCountVariants>) => string;
export declare const badgeDotClass: (variants: VariantProps<typeof badgeDotVariants>) => string;
export declare const badgeStatusDotClass: (variants: VariantProps<typeof badgeStatusDotVariants>) => string;
export declare const badgeStatusTextClass: (variants: VariantProps<typeof badgeStatusTextVariants>) => string;
export declare const ribbonClass: (variants: VariantProps<typeof ribbonVariants>) => string;
export declare const ribbonContentClass: (variants: VariantProps<typeof ribbonContentVariants>) => string;
export declare const ribbonWrapperClass: (variants: VariantProps<typeof ribbonWrapperVariants>) => string;
export {};
