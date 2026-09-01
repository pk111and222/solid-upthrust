import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { BadgeStatus } from 'upthrust-competence';
export type BadgeSize = 'small' | 'middle';
/** antd PresetStatusColorType + 'gray' (the library's neutral mapping). */
export type BadgeColor = 'blue' | 'red' | 'green' | 'gray' | string;
export type BadgePlacement = 'start' | 'end';
export interface BadgeSemanticSlots {
    root?: string;
    indicator?: string;
}
export interface BadgeSemanticStyles {
    root?: JSX.CSSProperties;
    indicator?: JSX.CSSProperties;
}
export interface BadgeProps {
    /** Number/string renders a pill (numbers get overflow formatting); JSX = custom badge node. */
    count?: number | string | JSX.Element;
    /** Cap for numeric counts; above shows `${overflowCount}+`. Default 99. */
    overflowCount?: number;
    /** Zero counts stay hidden unless true. */
    showZero?: boolean;
    /** Red dot mode — no number. */
    dot?: boolean;
    size?: BadgeSize;
    /** `[x, y]` badge offset from the corner; positive x pushes further out. */
    offset?: [number | string, number | string];
    status?: BadgeStatus;
    /** Named preset ('blue'|'red'|'green'|'gray') or any CSS color. */
    color?: BadgeColor;
    /** Status text beside the dot (status mode). */
    text?: JSX.Element;
    /** Badge tooltip; default = the count. null/false disables. */
    title?: string | null | false;
    classNames?: BadgeSemanticSlots;
    styles?: BadgeSemanticStyles;
    class?: string;
    style?: JSX.CSSProperties;
    /** Wrapping target — the badge anchors to its top-right corner. */
    children?: JSX.Element;
}
declare const Badge: Component<BadgeProps>;
export interface BadgeRibbonProps {
    /** Ribbon label. */
    text?: JSX.Element;
    /** Named preset ('blue'|'red'|'green'|'gray') or any CSS color. Default primary. */
    color?: BadgeColor;
    /** Corner the ribbon hangs from. Default 'end'. */
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
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
declare const BadgeRibbon: Component<BadgeRibbonProps>;
export default Badge;
export { BadgeRibbon };
