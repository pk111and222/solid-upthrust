import { JSX } from '@solidjs/web';
import { BadgeStatus, PresetColor } from 'upthrust-competence';
export type { BadgeStatus } from 'upthrust-competence';
/** middle 为本库命名；medium 为 antd 6 命名，两者等价。 */
export type BadgeSize = 'small' | 'middle' | 'medium';
/** antd 预设色板、本库扩展的 gray，或任意 CSS 颜色。 */
export type BadgeColor = PresetColor | 'gray' | (string & {});
export type BadgePlacement = 'start' | 'end';
export interface BadgeSemanticSlots {
    root?: string;
    indicator?: string;
}
export interface BadgeSemanticStyles {
    root?: JSX.CSSProperties;
    indicator?: JSX.CSSProperties;
}
export interface BadgeProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'title' | 'children' | 'class' | 'style' | 'color'> {
    /** 数字/字符串渲染为圆角数字（超出 overflowCount 显示 N+）；JSX 为自定义徽标节点。 */
    count?: number | string | JSX.Element;
    /** 封顶数值，默认 99。 */
    overflowCount?: number;
    /** 数值为 0 时仍然显示。 */
    showZero?: boolean;
    /** 只显示小圆点。 */
    dot?: boolean;
    /** 数字尺寸，默认 middle。 */
    size?: BadgeSize;
    /** [x, y] 偏移：x 越大越向右外移（right: -x），y 为 margin-top。 */
    offset?: [number | string, number | string];
    status?: BadgeStatus;
    color?: BadgeColor;
    /** 状态点旁的文本（status 或 color 时生效）。 */
    text?: JSX.Element;
    /** 悬停提示，默认取 count；null/false 移除。 */
    title?: string | null | false;
    classNames?: BadgeSemanticSlots;
    styles?: BadgeSemanticStyles;
    class?: string;
    /** 与 antd 一致：状态点模式作用于根节点，其余作用于徽标节点。 */
    style?: JSX.CSSProperties;
    /** 被包裹的元素，徽标定位在其右上角。 */
    children?: JSX.Element;
}
declare const Badge: (rawProps: BadgeProps) => JSX.Element;
export interface BadgeRibbonProps {
    /** 缎带内容。 */
    text?: JSX.Element;
    /** 预设色板、本库扩展的 gray 或任意 CSS 颜色；默认主题主色。 */
    color?: BadgeColor;
    /** 缎带所在的角，默认 end。 */
    placement?: BadgePlacement;
    classNames?: {
        root?: string;
        indicator?: string;
        content?: string;
    };
    styles?: {
        root?: JSX.CSSProperties;
        indicator?: JSX.CSSProperties;
        content?: JSX.CSSProperties;
    };
    /** 与 antd 一致作用于缎带节点（indicator）。根节点使用 classNames.root / styles.root。 */
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
declare const BadgeRibbon: (rawProps: BadgeRibbonProps) => JSX.Element;
export default Badge;
export { BadgeRibbon };
