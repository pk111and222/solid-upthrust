import { VariantProps } from 'class-variance-authority';
/**
 * FloatButton styles — antd 6 `float-button/style` (button.js + group.js):
 *  - button: Button size=large as a 40px column (width 40, min-height 40,
 *    height auto, padding 4px 0, gap 2px), text wraps; icon-only → icon 18px
 *    (fontSizeIcon × 1.5), content 12px (fontSizeSM)
 *  - shape: circle 50% | square borderRadiusLG 8px
 *  - individual (not in a group): fixed, z-index 1000 (zIndexPopupBase),
 *    inset-inline-end 24 (marginLG), bottom 48 (marginXXL), boxShadowSecondary
 *  - group: fixed at the same corner; the list is a Flex (circle: gap 16,
 *    every item keeps its own shadow) or a Space.Compact (square: borders
 *    collapse, the list carries the shadow + 8px radius); menu mode (trigger)
 *    positions the list absolutely one size + padding (56px) from the trigger
 *    and animates it from translate(±40px) + opacity 0 over 0.3s
 *  - badge: absolute top / inline-end, translate(50%, -50%) unless dot; the
 *    circle shape insets it by r·(√2−1)/√2 (controlHeight / 2 based)
 */
declare const floatButtonVariants: (props?: ({
    colorScheme?: "disabled" | "default" | "primary" | null | undefined;
    shape?: "circle" | "square" | null | undefined;
    layout?: "fixed" | "item" | "compact" | null | undefined;
    compact?: "horizontal" | "vertical" | "none" | null | undefined;
    clickable?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export type FloatButtonStyleVariants = VariantProps<typeof floatButtonVariants>;
export declare const floatButtonClass: (v: FloatButtonStyleVariants) => string;
declare const floatButtonIconVariants: (props?: ({
    iconOnly?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const floatButtonIconClass: (v: VariantProps<typeof floatButtonIconVariants>) => string;
export declare const floatButtonContentClass = "text-[12px] leading-[1.5714]";
declare const floatButtonBadgeVariants: (props?: ({
    offset?: "circle" | "square" | "circle-dot" | "square-dot" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const floatButtonBadgeClass: (v: VariantProps<typeof floatButtonBadgeVariants>) => string;
declare const backTopFadeVariants: (props?: ({
    visible?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const backTopFadeClass: (v: VariantProps<typeof backTopFadeVariants>) => string;
export declare const floatGroupClass: string;
declare const floatGroupListVariants: (props?: ({
    axis?: "horizontal" | "vertical" | null | undefined;
    individual?: boolean | null | undefined;
    menu?: "left" | "right" | "bottom" | "top" | "none" | null | undefined;
    motion?: "visible" | "none" | "hidden-top" | "hidden-bottom" | "hidden-left" | "hidden-right" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const floatGroupListClass: (v: VariantProps<typeof floatGroupListVariants>) => string;
/** Every class the variants can emit — the dead-class theme test walks this. */
export declare const floatButtonClassMatrix: () => string[];
export {};
