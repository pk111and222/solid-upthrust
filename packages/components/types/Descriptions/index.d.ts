import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
export type DescriptionsSize = 'small' | 'middle' | 'large';
export type DescriptionsLayout = 'horizontal' | 'vertical';
export interface DescriptionsItem {
    /** Label of the field. */
    label?: JSX.Element;
    /** Value of the field. */
    children?: JSX.Element;
    /** Number of columns included. Default 1; 'filled' takes the rest of the row. */
    span?: number | 'filled';
    /** Per-item colon override (horizontal layout only). */
    colon?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
}
export interface DescriptionsSemanticSlots {
    root?: string;
    header?: string;
    title?: string;
    extra?: string;
    label?: string;
    content?: string;
}
export interface DescriptionsSemanticStyles {
    root?: JSX.CSSProperties;
    header?: JSX.CSSProperties;
    title?: JSX.CSSProperties;
    extra?: JSX.CSSProperties;
    label?: JSX.CSSProperties;
    content?: JSX.CSSProperties;
}
export interface DescriptionsProps {
    /** Field items. */
    items: DescriptionsItem[];
    /** Title rendered top-left; extra renders top-right. */
    title?: JSX.Element;
    /** The action area of the description list, placed at the top-right. */
    extra?: JSX.Element;
    /** Number of description items per row. Default 3. */
    column?: number | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl', number>>;
    /** Border mode: renders a bordered grid. Default false. */
    bordered?: boolean;
    /** Size of the list. Default 'middle'. */
    size?: DescriptionsSize;
    /** Layout: horizontal (label beside content) or vertical (label row above content row). Default 'horizontal'. */
    layout?: DescriptionsLayout;
    /** Show colon after labels (horizontal layout). Default true. */
    colon?: boolean;
    /** Semantic class slots. */
    classNames?: DescriptionsSemanticSlots;
    /** Semantic inline styles. */
    styles?: DescriptionsSemanticStyles;
    class?: string;
    style?: JSX.CSSProperties;
}
/** A packed cell: span counts BORDERED tracks (label + content pair). */
export interface DescriptionsRowCell {
    item: DescriptionsItem;
    /** Rendered span of BOTH the th and td (antd: td colspan = span*2-1). */
    span: number;
}
declare const Descriptions: Component<DescriptionsProps>;
export default Descriptions;
