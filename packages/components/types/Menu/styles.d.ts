export type MenuThemeKey = "light" | "dark";
export declare const menuRootClass: (props?: ({
    scheme?: "light-vertical" | "light-inline" | "light-horizontal" | "dark-vertical" | "dark-inline" | "dark-horizontal" | null | undefined;
    collapsed?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/**
 * 菜单项（li）与子菜单标题（div）共用。
 *  - block：vertical / inline 根列表，40px 高、左右 4px 外边距、8px 圆角
 *  - popup：弹出层内，圆角 4px
 *  - collapsed：inline 收起时的一级项，左右 padding = calc(50% - 8px - 4px) 使图标居中
 *  - horizontal：水平一级项，inline 区块 + 底部 2px 指示条（::after）
 */
export declare const menuItemClass: (props?: ({
    layout?: "horizontal" | "block" | "popup" | "collapsed" | null | undefined;
    grouped?: boolean | null | undefined;
    arrow?: boolean | null | undefined;
    tone?: "light-v-idle" | "light-v-active" | "light-v-selected" | "light-v-danger" | "light-v-danger-selected" | "light-v-disabled" | "light-h-idle" | "light-h-active" | "light-h-selected" | "light-h-danger" | "light-h-danger-selected" | "light-h-disabled" | "dark-v-idle" | "dark-v-active" | "dark-v-selected" | "dark-v-danger" | "dark-v-danger-selected" | "dark-v-disabled" | "dark-h-idle" | "dark-h-active" | "dark-h-selected" | "dark-h-danger" | "dark-h-danger-selected" | "dark-h-disabled" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/**
 * 子菜单 li 容器：非水平时只是结构节点；水平一级时由 menuItemClass 承担视觉。
 * 不能 relative：嵌套弹层直接渲染在父弹层内，需以父弹层（absolute）为定位祖先，
 * 才不会被父列表的 overflow-y-auto 裁剪。
 */
export declare const menuSubmenuClass: (props?: ({
    horizontal?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** inline 收起时的悬浮提示：链接继承 tooltip 文字色、去下划线。 */
export declare const MENU_TOOLTIP_CLASS: string[];
export declare const menuIconClass: (props?: ({
    collapsed?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const menuContentClass: (props?: ({
    withIcon?: boolean | null | undefined;
    withExtra?: boolean | null | undefined;
    collapsed?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const MENU_LABEL_CLASS: string[];
export declare const menuExtraClass: (props?: ({
    theme?: "dark" | "light" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** inline 收起时无图标一级项：只显示首字符（fontSizeLG 居中）。 */
export declare const MENU_NOICON_CLASS: string[];
export declare const menuArrowClass: (props?: ({
    direction?: "right" | "up" | "down" | null | undefined;
    collapsed?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const menuGroupTitleClass: (props?: ({
    theme?: "dark" | "light" | null | undefined;
    inset?: "root" | "collapsed" | "inline-sub" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const MENU_GROUP_CLASS: string[];
export declare const MENU_GROUP_LIST_CLASS: string[];
export declare const menuDividerClass: (props?: ({
    theme?: "dark" | "light" | null | undefined;
    dashed?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** inline 子列表的折叠容器：grid-template-rows 0fr ↔ 1fr 过渡高度。 */
export declare const menuInlineCollapseClass: (props?: ({
    open?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const menuInlineListClass: (props?: ({
    theme?: "dark" | "light" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/**
 * 弹出层外壳（由 createTrigger 定位）。与 antd 一致：朝向触发器的一侧留 8px 透明 padding，
 * 让鼠标从标题移入弹层时 hover 区域连续；原点随实际方位变化。
 */
export declare const menuPopupLayerClass: (props?: ({
    visible?: boolean | null | undefined;
    placement?: "left" | "right" | "bottomLeft" | "bottomRight" | "bottom" | "topLeft" | "topRight" | "top" | "leftTop" | "leftBottom" | "rightTop" | "rightBottom" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export declare const menuPopupListClass: (props?: ({
    theme?: "dark" | "light" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
