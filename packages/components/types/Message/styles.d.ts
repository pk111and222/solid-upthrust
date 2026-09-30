import { VariantProps } from 'class-variance-authority';
/**
 * antd 6 Message（message/style + notification/style 共享的 list / item 样式）：
 *  - list：fixed、z-index zIndexPopupBase 1000 + CONTAINER_MAX_OFFSET 1000 + 10 = 2010，水平居中，
 *    可见 notice 顶边距视口 `top`（默认 8px），pointer-events none。
 *  - listContent：flex 纵向，notice 间距 notificationMarginBottom = margin 16px。
 *  - notice：padding (40 − 14×1.5714)/2 = 9px × paddingSM 12px，colorBgElevated、borderRadiusLG 8px、boxShadow，
 *    width max-content、max-width calc(100vw − 48px)，14px / 1.5714 / colorText，word-wrap break-word。
 *  - wrapper：flex items-center gap marginXS 8px；icon：flex none、fontSizeLG 16px、line-height 1，
 *    success / warning / error 各自色、info 与 loading 用 colorInfo（主色）。
 *  - 动效：transform / opacity motionDurationMid 0.2s；进出场自 translateY(∓64px) + opacity 0。
 */
declare const messageListVariants: (props?: ({
    placement?: "bottom" | "top" | "center" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const messageListContentVariants: (props?: ({
    placement?: "bottom" | "top" | "center" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const messageRowVariants: (props?: ({
    closing?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const messageRowInnerVariants: (props?: ({
    closing?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const messageRowPadVariants: (props?: ({
    placement?: "bottom" | "top" | "center" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const messageNoticeVariants: (props?: ({
    state?: "visible" | "enter-top" | "enter-bottom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const messageWrapperVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const messageIconVariants: (props?: ({
    type?: "error" | "warning" | "success" | "none" | "loading" | "info" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
declare const messageTitleVariants: (props?: ({} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const messageListClass: (variants: VariantProps<typeof messageListVariants>) => string;
export declare const messageListContentClass: (variants: VariantProps<typeof messageListContentVariants>) => string;
export declare const messageRowClass: (variants: VariantProps<typeof messageRowVariants>) => string;
export declare const messageRowInnerClass: (variants: VariantProps<typeof messageRowInnerVariants>) => string;
export declare const messageRowPadClass: (variants: VariantProps<typeof messageRowPadVariants>) => string;
export declare const messageNoticeClass: (variants: VariantProps<typeof messageNoticeVariants>) => string;
export declare const messageWrapperClass: (variants: VariantProps<typeof messageWrapperVariants>) => string;
export declare const messageIconClass: (variants: VariantProps<typeof messageIconVariants>) => string;
export declare const messageTitleClass: (variants: VariantProps<typeof messageTitleVariants>) => string;
/** LoadingOutlined 的 1s 线性旋转。 */
export declare const MESSAGE_LOADING_SPIN = "animate-spin";
/** Every variant combination, for dead-class tests. */
export declare const messageClassMatrix: () => string[];
export {};
