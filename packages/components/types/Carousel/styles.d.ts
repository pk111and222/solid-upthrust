import { VariantProps } from 'class-variance-authority';
declare const carouselRootVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const carouselTrackVariants: (props?: ({
    animate?: boolean | null | undefined;
    vertical?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const carouselSlideVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const carouselArrowVariants: (props?: ({
    side?: "left" | "right" | "up" | "down" | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const carouselDotsVariants: (props?: ({
    position?: "inner" | "outer" | null | undefined;
    vertical?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const carouselDotVariants: (props?: ({
    active?: boolean | null | undefined;
    vertical?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const carouselRootClass: (variants: VariantProps<typeof carouselRootVariants>) => string;
export declare const carouselTrackClass: (variants: VariantProps<typeof carouselTrackVariants>) => string;
export declare const carouselSlideClass: (variants: VariantProps<typeof carouselSlideVariants>) => string;
export declare const carouselArrowClass: (variants: VariantProps<typeof carouselArrowVariants>) => string;
export declare const carouselDotsClass: (variants: VariantProps<typeof carouselDotsVariants>) => string;
export declare const carouselDotClass: (variants: VariantProps<typeof carouselDotVariants>) => string;
export declare const CAROUSEL_PREV_ICON = "i-mdi-chevron-left";
export declare const CAROUSEL_NEXT_ICON = "i-mdi-chevron-right";
export declare const CAROUSEL_UP_ICON = "i-mdi-chevron-up";
export declare const CAROUSEL_DOWN_ICON = "i-mdi-chevron-down";
export {};
