/**
 * Timeline 的纯数据层：对照 antd 6.6.5 `timeline/{Timeline,useItems}` 移植模式归一、
 * 旧字段兼容、pending 追加、reverse 与导轨状态。节点内容（JSX）以泛型透传，不在这里渲染。
 */
export type TimelineMode = 'start' | 'end' | 'alternate';
/** @deprecated left / right 请改用 start / end */
export type TimelineLegacyMode = 'left' | 'right';
export type TimelinePlacement = 'start' | 'end';
export type TimelineOrientation = 'vertical' | 'horizontal';
export type TimelineItemStatus = 'finish' | 'process';
export type TimelinePresetColor = 'blue' | 'red' | 'green' | 'gray';
export declare const TIMELINE_PRESET_COLORS: readonly TimelinePresetColor[];
export interface TimelineItemSource<N> {
    color?: string;
    title?: N;
    /** @deprecated 请使用 title */
    label?: N;
    content?: N;
    /** @deprecated 请使用 content */
    children?: N;
    icon?: N;
    /** @deprecated 请使用 icon */
    dot?: N;
    placement?: TimelinePlacement;
    /** @deprecated 请使用 placement */
    position?: TimelinePlacement;
    loading?: boolean;
}
export interface TimelineNormalizedItem<N, S> {
    /** 原始条目（含 class / style / classNames 等扩展字段）；pending 追加项为 undefined。 */
    source?: S;
    title?: N;
    content?: N;
    /** 显式图标；loading 且无图标时为 undefined、`loading` 为 true，由 UI 渲染加载图标。 */
    icon?: N;
    loading: boolean;
    placement: TimelinePlacement;
    status: TimelineItemStatus;
    /** 预设色名；自定义颜色写入 dotColor。 */
    presetColor?: TimelinePresetColor;
    dotColor?: string;
    /** 由 pending 属性追加的节点。 */
    pending: boolean;
}
export declare const normalizeTimelineMode: (mode?: string) => TimelineMode;
/** useItems：旧字段回落、交替布局的奇偶 placement、pending 追加（在 reverse 之前）。 */
export declare const normalizeTimelineItems: <N, S extends TimelineItemSource<N>>(items: readonly S[] | undefined, mode: TimelineMode, pending?: {
    content: N;
    icon?: N;
}) => TimelineNormalizedItem<N, S>[];
/** 导轨状态：默认跟随下一个节点；reverse 时跟随自身（antd railFollowPrevStatus）。 */
export declare const timelineRailStatus: <T extends {
    status: TimelineItemStatus;
}>(items: readonly T[], index: number, reverse: boolean) => TimelineItemStatus;
/** 交替布局：mode=alternate，或纵向时任一节点有标题。 */
export declare const timelineLayoutAlternate: (mode: TimelineMode, orientation: TimelineOrientation, items: readonly {
    title?: unknown;
}[]) => boolean;
/**
 * 标题占比（到圆点中心的距离）：数字为 24 栅格份数，字符串为任意长度。交替模式与横向不生效。
 * 返回 CSS 长度，默认 12 份 = 50%。
 */
export declare const timelineHeadSpan: (titleSpan: number | string | undefined | null, mode: TimelineMode) => string;
