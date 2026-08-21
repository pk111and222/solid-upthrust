import { VariantProps } from 'class-variance-authority';
declare const timelineVariants: (props?: ({
    orientation?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const timelineItemVariants: (props?: ({
    layout?: "horizontal" | "vertical-plain-start" | "vertical-plain-end" | "vertical-titled" | "vertical-alternate" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const timelineDotColumnVariants: (props?: ({
    position?: "horizontal" | "vertical-start" | "vertical-center" | "vertical-end" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const timelineRailVariants: (props?: ({
    orientation?: "horizontal" | "vertical" | null | undefined;
    last?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const timelineDotVariants: (props?: ({
    colorScheme?: "outlined-blue" | "outlined-red" | "outlined-green" | "outlined-gray" | "filled-blue" | "filled-red" | "filled-green" | "filled-gray" | null | undefined;
    orientation?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const timelineCustomIconVariants: (props?: ({
    color?: "blue" | "gray" | "green" | "red" | null | undefined;
    orientation?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const timelineLoadingIconVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const timelineTitleVariants: (props?: ({
    position?: "vertical-left" | "vertical-right" | "horizontal-top" | "horizontal-bottom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const timelineContentVariants: (props?: ({
    position?: "vertical-plain-start" | "vertical-plain-end" | "vertical-left" | "vertical-right" | "horizontal-top" | "horizontal-bottom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const timelineClass: (variants: VariantProps<typeof timelineVariants>) => string;
export declare const timelineItemClass: (variants: VariantProps<typeof timelineItemVariants>) => string;
export declare const timelineDotColumnClass: (variants: VariantProps<typeof timelineDotColumnVariants>) => string;
export declare const timelineRailClass: (variants: VariantProps<typeof timelineRailVariants>) => string;
export declare const timelineDotClass: (variants: VariantProps<typeof timelineDotVariants>) => string;
export declare const timelineCustomIconClass: (variants: VariantProps<typeof timelineCustomIconVariants>) => string;
export declare const timelineLoadingIconClass: (variants: VariantProps<typeof timelineLoadingIconVariants>) => string;
export declare const timelineTitleClass: (variants: VariantProps<typeof timelineTitleVariants>) => string;
export declare const timelineContentClass: (variants: VariantProps<typeof timelineContentVariants>) => string;
export {};
