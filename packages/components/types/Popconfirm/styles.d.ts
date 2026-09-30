import { VariantProps } from 'class-variance-authority';
/**
 * antd 6 Popconfirm（popconfirm/style + popover/style）：
 *  - 浮层：Popover 容器 colorBgElevated、borderRadiusLG 8px、padding 12px、width max-content / max-width 100vw，
 *    fontSize 14 / colorText，zIndexPopup = 1000 + 60。
 *  - message：flex nowrap items-start，margin-bottom 8px；图标 colorWarning、14px、line-height 1、右距 8px。
 *  - title：fontWeightStrong 600、colorTextHeading；无描述（only-child）时 normal。
 *  - description：margin-top 4px、colorText。
 *  - buttons：text-align end、nowrap、按钮之间 margin-inline-start 8px。
 */
declare const popconfirmOverlayVariants: (props?: ({
    visible?: boolean | null | undefined;
    placement?: "left" | "right" | "bottomLeft" | "bottomRight" | "bottom" | "topLeft" | "topRight" | "top" | "leftTop" | "leftBottom" | "rightTop" | "rightBottom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const popconfirmContainerVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const popconfirmMessageVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const popconfirmIconVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const popconfirmTitleVariants: (props?: ({
    strong?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const popconfirmDescriptionVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const popconfirmButtonsVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const popconfirmOverlayClass: (variants: VariantProps<typeof popconfirmOverlayVariants>) => string;
export declare const popconfirmContainerClass: (variants: VariantProps<typeof popconfirmContainerVariants>) => string;
export declare const popconfirmMessageClass: (variants: VariantProps<typeof popconfirmMessageVariants>) => string;
export declare const popconfirmIconClass: (variants: VariantProps<typeof popconfirmIconVariants>) => string;
export declare const popconfirmTitleClass: (variants: VariantProps<typeof popconfirmTitleVariants>) => string;
export declare const popconfirmDescriptionClass: (variants: VariantProps<typeof popconfirmDescriptionVariants>) => string;
export declare const popconfirmButtonsClass: (variants: VariantProps<typeof popconfirmButtonsVariants>) => string;
export declare const popconfirmArrowClass: (side: "top" | "bottom" | "left" | "right") => string;
/** Every variant combination, for dead-class tests. */
export declare const popconfirmClassMatrix: () => string[];
export {};
