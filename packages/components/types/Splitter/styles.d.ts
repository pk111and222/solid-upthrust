import { VariantProps } from 'class-variance-authority';
/**
 * 标记类：不产生样式，供嵌套选择器（面板内只含一个子 Splitter 时隐藏滚动条）
 * 与使用方定位节点。
 */
export declare const SPLITTER_MARKER: {
    readonly root: "upthrust-splitter";
    readonly panel: "upthrust-splitter-panel";
    readonly bar: "upthrust-splitter-bar";
    readonly dragger: "upthrust-splitter-dragger";
    readonly draggerIcon: "upthrust-splitter-dragger-icon";
    readonly preview: "upthrust-splitter-preview";
    readonly collapse: "upthrust-splitter-collapse";
    readonly mask: "upthrust-splitter-mask";
};
export declare const splitterVariants: (props?: ({
    orientation?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/**
 * 面板：自身滚动（细滚动条）；尺寸为 0 时裁剪；只含一个嵌套 Splitter 时不滚动。
 * motion 过渡只作用于 flex-basis（折叠按钮与键盘调整时动画，拖拽中由组件关闭）。
 */
export declare const splitterPanelVariants: (props?: ({
    collapsed?: boolean | null | undefined;
    motion?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** 分隔条本身不占空间（宽或高为 0），拖拽热区与按钮都绝对定位在它两侧。 */
export declare const splitterBarVariants: (props?: ({
    orientation?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/**
 * 拖拽热区 6px；::before 为 2px 分隔线，::after 为 20px 抓手。
 * state：idle 悬停变浅主色；active 拖拽中加深；disabled 无抓手、默认光标。
 * customize：自定义 draggerIcon 时隐藏默认抓手。
 */
export declare const splitterDraggerVariants: (props?: ({
    orientation?: "horizontal" | "vertical" | null | undefined;
    state?: "disabled" | "active" | "idle" | null | undefined;
    customize?: boolean | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** 自定义拖拽图标：居中；拖拽中变主色；不可拖拽时隐藏。 */
export declare const splitterDraggerIconVariants: (props?: ({
    state?: "disabled" | "active" | "idle" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** lazy 模式的拖拽预览线：2px 主色 20% 透明度，按受约束的偏移平移。 */
export declare const splitterPreviewVariants: (props?: ({
    orientation?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/**
 * 折叠按钮：12×24（纵向 24×12），分别挂在分隔条前后 3px 处。
 * placement 合并了方向与前后位置；visibility：visible 常显、hidden 不显示、
 * hover 仅在悬停 / 聚焦分隔条（及无悬停能力的触屏）时显示。
 */
export declare const splitterCollapseVariants: (props?: ({
    placement?: "horizontal-start" | "horizontal-end" | "vertical-start" | "vertical-end" | null | undefined;
    appearance?: "default" | "customize" | null | undefined;
    visibility?: "visible" | "hidden" | "hover" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** 折叠按钮的默认图标：横向左 / 右箭头，纵向上 / 下箭头。 */
export declare const SPLITTER_COLLAPSE_ICON: {
    readonly "horizontal-start": "i-mdi-chevron-left";
    readonly "horizontal-end": "i-mdi-chevron-right";
    readonly "vertical-start": "i-mdi-chevron-up";
    readonly "vertical-end": "i-mdi-chevron-down";
};
/** 拖拽期间覆盖整个视口，锁定光标并挡住 iframe 等吞事件的元素。 */
export declare const splitterMaskVariants: (props?: ({
    orientation?: "horizontal" | "vertical" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
/** Splitter 外单独使用 Panel 时的普通块（不参与分割）。 */
export declare const PANEL_STANDALONE_CLASS: string[];
export type SplitterStyleVariants = VariantProps<typeof splitterVariants>;
export type SplitterDraggerState = NonNullable<VariantProps<typeof splitterDraggerVariants>["state"]>;
export type SplitterCollapseVisibility = NonNullable<VariantProps<typeof splitterCollapseVariants>["visibility"]>;
