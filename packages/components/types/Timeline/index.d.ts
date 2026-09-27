import { JSX } from '@solidjs/web';
import { TimelineMode, TimelineLegacyMode, TimelineOrientation, TimelinePlacement } from 'upthrust-competence';
import { SemanticInput } from '../../common/semantic';
export type { TimelineMode, TimelineLegacyMode, TimelineOrientation, TimelinePlacement, TimelineItemStatus } from 'upthrust-competence';
export type TimelineVariant = 'outlined' | 'filled';
/** 预设 blue / red / green / gray，或任意 CSS 颜色。 */
export type TimelineColor = 'blue' | 'red' | 'green' | 'gray' | (string & {});
export interface TimelineItemSemanticClassNames {
    root?: string;
    wrapper?: string;
    icon?: string;
    header?: string;
    title?: string;
    section?: string;
    content?: string;
    rail?: string;
}
export interface TimelineItemSemanticStyles {
    root?: JSX.CSSProperties;
    wrapper?: JSX.CSSProperties;
    icon?: JSX.CSSProperties;
    header?: JSX.CSSProperties;
    title?: JSX.CSSProperties;
    section?: JSX.CSSProperties;
    content?: JSX.CSSProperties;
    rail?: JSX.CSSProperties;
}
export interface TimelineItemProps {
    key?: string | number;
    /** 圆点颜色，默认 blue。 */
    color?: TimelineColor;
    title?: JSX.Element;
    /** @deprecated 请使用 title */
    label?: JSX.Element;
    content?: JSX.Element;
    /** @deprecated 请使用 content */
    children?: JSX.Element;
    /** 自定义节点图标。 */
    icon?: JSX.Element;
    /** @deprecated 请使用 icon */
    dot?: JSX.Element;
    /** 加载中：无 icon 时显示加载图标。 */
    loading?: boolean;
    /** 节点位置（覆盖 mode 推导）。 */
    placement?: TimelinePlacement;
    /** @deprecated 请使用 placement */
    position?: TimelinePlacement;
    classNames?: TimelineItemSemanticClassNames;
    styles?: TimelineItemSemanticStyles;
    class?: string;
    style?: JSX.CSSProperties;
}
export interface TimelineSemanticClassNames {
    root?: string;
    item?: string;
    itemWrapper?: string;
    itemIcon?: string;
    itemSection?: string;
    itemHeader?: string;
    itemTitle?: string;
    itemContent?: string;
    itemRail?: string;
}
export interface TimelineSemanticStyles {
    root?: JSX.CSSProperties;
    item?: JSX.CSSProperties;
    itemWrapper?: JSX.CSSProperties;
    itemIcon?: JSX.CSSProperties;
    itemSection?: JSX.CSSProperties;
    itemHeader?: JSX.CSSProperties;
    itemTitle?: JSX.CSSProperties;
    itemContent?: JSX.CSSProperties;
    itemRail?: JSX.CSSProperties;
}
/** 函数形式 classNames / styles 的参数：props 含合并后的 mode / orientation / variant / items。 */
export interface TimelineSemanticInfo {
    props: TimelineProps & {
        mode: TimelineMode;
        orientation: TimelineOrientation;
        variant: TimelineVariant;
        items: TimelineItemProps[];
    };
}
export interface TimelineProps extends Omit<JSX.HTMLAttributes<HTMLOListElement>, 'class' | 'style' | 'children'> {
    items?: TimelineItemProps[];
    /** 'start' | 'alternate' | 'end'，默认 'start'；'left' / 'right' 为废弃别名。 */
    mode?: TimelineMode | TimelineLegacyMode;
    /** 默认 'vertical'。 */
    orientation?: TimelineOrientation;
    /** 默认 'outlined'。 */
    variant?: TimelineVariant;
    /** 节点倒序。 */
    reverse?: boolean;
    /** 标题占比（到圆点中心的距离）：数字为 24 栅格份数，字符串为 CSS 长度；默认 12。 */
    titleSpan?: number | string;
    /** @deprecated 直接追加一个 loading 节点 */
    pending?: JSX.Element;
    /** @deprecated 直接追加一个带 icon 的节点 */
    pendingDot?: JSX.Element;
    classNames?: SemanticInput<TimelineSemanticClassNames, TimelineSemanticInfo>;
    styles?: SemanticInput<TimelineSemanticStyles, TimelineSemanticInfo>;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const _default: ((rawProps: TimelineProps) => JSX.Element) & {
    Item: (_props: TimelineItemProps) => JSX.Element;
};
export default _default;
