import { VariantProps } from 'class-variance-authority';
declare const cardVariants: (props?: ({
    variant?: "outlined" | "borderless" | null | undefined;
    inner?: boolean | null | undefined;
    hoverable?: boolean | null | undefined;
    loading?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const cardHeadVariants: (props?: ({
    size?: "small" | "middle" | null | undefined;
    inner?: boolean | null | undefined;
    hasTabs?: boolean | null | undefined;
    grid?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const cardHeadWrapperVariants: (props?: ({
    padded?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const cardTitleAccentVariants: (props?: ({
    size?: "small" | "middle" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const cardCoverVariants: (props?: ({
    zoom?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const cardBodyVariants: (props?: ({
    size?: "small" | "middle" | null | undefined;
    inner?: boolean | null | undefined;
    first?: boolean | null | undefined;
    last?: boolean | null | undefined;
    grid?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const cardGridVariants: (props?: ({
    hoverable?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const cardClass: (variants: VariantProps<typeof cardVariants>) => string;
export declare const cardHeadClass: (variants: VariantProps<typeof cardHeadVariants>) => string;
export declare const cardHeadWrapperClass: (variants: VariantProps<typeof cardHeadWrapperVariants>) => string;
export declare const cardTitleClass: () => string;
export declare const cardTitleAccentClass: (variants: VariantProps<typeof cardTitleAccentVariants>) => string;
export declare const cardExtraClass: () => string;
export declare const cardTabsClass: () => string;
export declare const cardCoverClass: (variants: VariantProps<typeof cardCoverVariants>) => string;
export declare const cardBodyClass: (variants: VariantProps<typeof cardBodyVariants>) => string;
export declare const cardActionsClass: () => string;
export declare const cardActionItemClass: () => string;
export declare const cardActionItemDividerClass: () => string;
export declare const cardActionSpanClass: () => string;
export declare const cardMetaClass: () => string;
export declare const cardMetaAvatarClass: () => string;
export declare const cardMetaSectionClass: () => string;
export declare const cardMetaTitleClass: () => string;
export declare const cardMetaDescriptionClass: () => string;
export declare const cardGridClass: (variants: VariantProps<typeof cardGridVariants>) => string;
export {};
