import { VariantProps } from 'class-variance-authority';
/**
 * Segmented styles — antd6 spec:
 *  - group: the pill track (bg-surface-variant, radius 6, inner padding 2)
 *  - item: equal-height transparent label; selected paints on-primary over
 *    the SHARED sliding thumb (the thumb renders behind items as an
 *    absolutely positioned white chip with a soft shadow)
 *  - sizes: control heights minus the 2px track padding (28/36/44 →
 *    item 24/32/40)
 *  - block: the group stretches to full width and items share it evenly
 */
declare const segmentedGroupVariants: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
    block?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const segmentedGroupClass: (v: VariantProps<typeof segmentedGroupVariants>) => string;
export declare const segmentedThumbClass: () => string;
declare const segmentedItemVariants: (props?: ({
    size?: "small" | "middle" | "large" | null | undefined;
    selected?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
    focused?: boolean | null | undefined;
    block?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const segmentedItemClass: (v: VariantProps<typeof segmentedItemVariants>) => string;
export declare const segmentedItemIconClass: () => string;
export declare const segmentedFocusAnchorClass: () => string;
export {};
