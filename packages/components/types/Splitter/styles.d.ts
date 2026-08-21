import { VariantProps } from 'class-variance-authority';
declare const splitterVariants: (props?: ({
    layout?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const splitterBarVariants: (props?: ({
    layout?: "horizontal" | "vertical" | null | undefined;
    active?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const splitterDraggerVariants: (props?: ({
    layout?: "horizontal" | "vertical" | null | undefined;
    active?: boolean | null | undefined;
    focused?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const splitterPanelVariants: (props?: ({
    layout?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export type SplitterStyleVariants = VariantProps<typeof splitterVariants>;
export declare const splitterClass: (variants: VariantProps<typeof splitterVariants>) => string;
export declare const splitterBarClass: (variants: VariantProps<typeof splitterBarVariants>) => string;
export declare const splitterDraggerClass: (variants: VariantProps<typeof splitterDraggerVariants>) => string;
export declare const splitterPanelClass: (variants: VariantProps<typeof splitterPanelVariants>) => string;
export {};
