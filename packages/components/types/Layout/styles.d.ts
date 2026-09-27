/**
 * 各区域的标记类。本身不产生样式，供 Layout 的子选择器定位直接子元素
 * （has-sider 时嵌套 Layout / Content 宽度归零），也方便消费方写选择器。
 */
export declare const LAYOUT_MARKER: {
    readonly layout: "upthrust-layout";
    readonly header: "upthrust-layout-header";
    readonly footer: "upthrust-layout-footer";
    readonly content: "upthrust-layout-content";
    readonly sider: "upthrust-layout-sider";
};
/**
 * Layout 根：纵向 flex 容器；含 Sider 时改为横向。
 * 横向时直接子级的嵌套 Layout / Content 宽度归零再由 flex-auto 撑开（antd 同款），
 * 宽表格等长内容因此不会把 Sider 挤窄。
 */
export declare const layoutVariants: (props?: ({
    hasSider?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** 顶部栏：64px 高、不参与伸缩。本库保持浅色顶栏（antd 默认深色 #001529）。 */
export declare const HEADER_CLASS: string[];
/** 底部栏：不参与伸缩。 */
export declare const FOOTER_CLASS: string[];
/** 内容区：占满剩余空间；min-h-0 允许在定高布局里收缩并自行滚动。 */
export declare const CONTENT_CLASS: string[];
/**
 * Sider 根：纵向 flex，body 占满、触发器贴底。宽度由内联 flex/width/min/max 决定。
 * 不在根上裁剪 overflow——零宽触发器画在根节点外侧（right:-40px）。
 * hasTrigger 时触发器在文档流内占 48px，内容不会被它盖住。
 */
export declare const siderVariants: (props?: ({
    theme?: "dark" | "light" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/**
 * Sider 内容容器：纵向占满剩余高度。横向裁剪，使收起过渡中的超宽内容不溢出到内容区；
 * 纵向在 Sider 定高（例如 h-screen）时滚动，触发器保持可见。
 */
export declare const SIDER_BODY_CLASS: string[];
/**
 * 常规触发器：位于 Sider 底部，sticky 贴住视口底边——Sider 比视口高时仍可点击
 * （antd 用 position:fixed，嵌在容器里的布局会跑出容器，这里改为 sticky）。
 * sticky 时会盖在内容上方，所以背景必须不透明，悬停只改文字色。
 */
export declare const siderTriggerVariants: (props?: ({
    theme?: "dark" | "light" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/**
 * 零宽触发器（collapsedWidth=0 时）：40×40 的标签页挂在 Sider 外侧、距顶 64px，
 * Sider 收起到 0 宽后仍可点开。side 取决于 reverseArrow；配色按 theme。
 * 位置与配色合并成一个变体键，保证所有类名都是 variants 下的字面量。
 */
export declare const siderZeroTriggerVariants: (props?: ({
    scheme?: "end-dark" | "start-dark" | "end-light" | "start-light" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export type SiderTheme = "dark" | "light";
