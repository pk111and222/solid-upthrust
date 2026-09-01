import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
/**
 * Card — pure presentation container (antd API). No headless counterpart:
 * every piece is stateless layout (the tab strip's state lives in the Tabs
 * material; loading swaps children for a Skeleton block).
 */
export type CardVariant = 'outlined' | 'borderless';
export type CardSize = 'small' | 'middle';
/** One entry of the card's tab strip (label + key, Tabs material parity). */
export interface CardTabItem {
    key: string;
    label: string;
    disabled?: boolean;
}
export interface CardProps {
    /** Card title (head row). */
    title?: JSX.Element;
    /** Content at the head's inline-end (actions link, extra controls). */
    extra?: JSX.Element;
    /** 'outlined' (hairline) or 'borderless' (tertiary shadow). Default outlined. */
    variant?: CardVariant;
    /** Compact paddings and a 38px head. Default middle. */
    size?: CardSize;
    /** Nested card: grey head band + tighter body padding. */
    type?: 'inner';
    /** Full-bleed media slot above the body (image clipped to top radius). */
    cover?: JSX.Element;
    /** Bottom action row; items split the width evenly. */
    actions?: JSX.Element[];
    /** Tab strip rendered under the head row (replaces head's hairline). */
    tabList?: CardTabItem[];
    activeTabKey?: string;
    defaultActiveTabKey?: string;
    onTabChange?: (key: string) => void;
    /** Replace the body with an active skeleton while pending. */
    loading?: boolean;
    /** Lift to standard shadow + transparent border on hover. */
    hoverable?: boolean;
    children?: JSX.Element;
    /** Semantic slots, antd parity. */
    classNames?: Partial<Record<'root' | 'header' | 'body' | 'extra' | 'title' | 'actions' | 'cover', string>>;
    styles?: Partial<Record<'root' | 'header' | 'body' | 'extra' | 'title' | 'actions' | 'cover', JSX.CSSProperties>>;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Card: Component<CardProps>;
export interface CardGridProps {
    /** Lift to standard shadow on hover. Default true. */
    hoverable?: boolean;
    children?: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
}
/**
 * A grid cell inside a Card body. Marks itself with `data-card-grid` so the
 * parent Card's body switches to the grid stage (flex-wrap + shadow
 * borders).
 */
declare const CardGrid: Component<CardGridProps>;
export interface CardMetaProps {
    avatar?: JSX.Element;
    title?: JSX.Element;
    description?: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
}
/** Avatar + title/description block (antd Card.Meta). */
declare const CardMeta: Component<CardMetaProps>;
export default Card;
export { CardGrid, CardMeta };
