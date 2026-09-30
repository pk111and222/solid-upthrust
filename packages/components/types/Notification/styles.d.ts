import { VariantProps } from 'class-variance-authority';
/**
 * antd 6 Notification（notification/style：index、placement、stack）：
 *  - list：fixed，z-index zIndexPopupBase 1000 + CONTAINER_MAX_OFFSET 1000 + 50 = 2050；top / bottom 偏移默认 24（内联 style），
 *    左右角距屏幕边 marginEdge 24px，top / bottom 水平居中。
 *  - wrapper：colorBgElevated、borderRadiusLG 8px、boxShadow；stack 模式下绝对定位贴 list 锚边，
 *    位置由 transform 表达（rc NoticeList 算法，transition transform 0.3s）。
 *  - notice：padding paddingMD 20px × paddingContentHorizontalLG 24px，width 384，max-width calc(100vw − 48px)，
 *    14px / 1.5714，word-wrap break-word，overflow hidden。
 *  - title：fontSizeLG 16 / lineHeightLG 1.5、colorTextHeading、margin-bottom 8；可关闭时右留 24；有图标时左让 12 + 24 = 36。
 *  - description：14px colorText、margin-top 8；首元素时 margin-top 0、右 12。
 *  - icon：absolute，24px（16 × 1.5）line-height 1；success / info / warning / error 各自语义色。
 *  - close：absolute top 20 / end 24，22×22（40 × 0.55），borderRadiusSM 4，colorIcon 0.45 → hover colorText + colorFillSecondary 0.06，
 *    active colorFill 0.15，color / background-color 0.2s。
 *  - actions：float right，margin-top 12。
 *  - progress：absolute bottom 0，左右内缩 8（borderRadiusLG），高 2，底 rgba(0,0,0,.04)，值为 primaryBorderHover → primary 渐变，显示剩余比例。
 *  - 动效：右侧角 translateX(100%)、左侧角 translateX(−100%)、top 自 −150px、bottom 自 +150px，配合 opacity 0.2s。
 */
declare const notificationListVariants: (props?: ({
    placement?: "bottomLeft" | "bottomRight" | "bottom" | "topLeft" | "topRight" | "top" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationWrapperVariants: (props?: ({
    stacked?: boolean | null | undefined;
    anchor?: "bottomLeft" | "bottomRight" | "bottom" | "topLeft" | "topRight" | "top" | null | undefined;
    state?: "visible" | "enter-top" | "enter-bottom" | "enter-right" | "enter-left" | "leave" | null | undefined;
    layer?: "hidden" | "front" | "peek" | "bridge" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationNoticeVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationContentVariants: (props?: ({
    concealed?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationIconVariants: (props?: ({
    type?: "error" | "warning" | "success" | "none" | "info" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationTitleVariants: (props?: ({
    closable?: boolean | null | undefined;
    withIcon?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationDescriptionVariants: (props?: ({
    first?: boolean | null | undefined;
    withIcon?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationActionsVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationCloseVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationProgressVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const notificationProgressFillVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const notificationListClass: (variants: VariantProps<typeof notificationListVariants>) => string;
export declare const notificationWrapperClass: (variants: VariantProps<typeof notificationWrapperVariants>) => string;
export declare const notificationNoticeClass: (variants: VariantProps<typeof notificationNoticeVariants>) => string;
export declare const notificationContentClass: (variants: VariantProps<typeof notificationContentVariants>) => string;
export declare const notificationIconClass: (variants: VariantProps<typeof notificationIconVariants>) => string;
export declare const notificationTitleClass: (variants: VariantProps<typeof notificationTitleVariants>) => string;
export declare const notificationDescriptionClass: (variants: VariantProps<typeof notificationDescriptionVariants>) => string;
export declare const notificationActionsClass: (variants: VariantProps<typeof notificationActionsVariants>) => string;
export declare const notificationCloseClass: (variants: VariantProps<typeof notificationCloseVariants>) => string;
export declare const notificationProgressClass: (variants: VariantProps<typeof notificationProgressVariants>) => string;
export declare const notificationProgressFillClass: (variants: VariantProps<typeof notificationProgressFillVariants>) => string;
/** Every variant combination, for dead-class tests. */
export declare const notificationClassMatrix: () => string[];
export {};
