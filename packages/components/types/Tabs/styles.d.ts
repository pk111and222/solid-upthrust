import { VariantProps } from 'class-variance-authority';
declare const tabsContainerVariants: (props?: ({
    tabPosition?: "left" | "right" | "bottom" | "top" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const tabBarVariants: (props?: ({
    tabPosition?: "left" | "right" | "bottom" | "top" | null | undefined;
    type?: "line" | "card" | null | undefined;
    positionType?: "top-line" | "bottom-line" | "left-line" | "right-line" | "top-card" | "bottom-card" | "left-card" | "right-card" | null | undefined;
    centered?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const tabItemVariants: (props?: ({
    state?: "idle-line" | "active-line" | "idle-card" | "active-card" | null | undefined;
    disabled?: boolean | null | undefined;
    type?: "line" | "card" | null | undefined;
    size?: "small" | "middle" | "large" | null | undefined;
    typeSize?: "line-small" | "line-middle" | "line-large" | "card-small" | "card-middle" | "card-large" | null | undefined;
    tabPosition?: "left" | "right" | "bottom" | "top" | null | undefined;
    typePosition?: "card-top" | "card-bottom" | "card-left" | "card-right" | "line-top" | "line-bottom" | "line-left" | "line-right" | null | undefined;
    statePosition?: "active-top" | "active-bottom" | "active-left" | "active-right" | "idle-top" | "idle-bottom" | "idle-left" | "idle-right" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const tabInkBarVariants: (props?: ({
    tabPosition?: "left" | "right" | "bottom" | "top" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const tabPanelVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const tabsContainerClass: (variants: VariantProps<typeof tabsContainerVariants>) => string;
export declare const tabBarClass: (variants: VariantProps<typeof tabBarVariants>) => string;
export declare const tabItemClass: (variants: VariantProps<typeof tabItemVariants>) => string;
export declare const tabInkBarClass: (variants: VariantProps<typeof tabInkBarVariants>) => string;
export declare const tabPanelClass: (variants: VariantProps<typeof tabPanelVariants>) => string;
export {};
