import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
export type TimelineColor = 'blue' | 'red' | 'green' | 'gray' | string;
export type TimelinePlacement = 'start' | 'end';
export type TimelineMode = TimelinePlacement | 'alternate';
export type TimelineOrientation = 'vertical' | 'horizontal';
export type TimelineVariant = 'outlined' | 'filled';
export interface TimelineItemProps {
    key?: string | number;
    color?: TimelineColor;
    title?: JSX.Element;
    content?: JSX.Element;
    icon?: JSX.Element;
    loading?: boolean;
    placement?: TimelinePlacement;
    class?: string;
    style?: JSX.CSSProperties;
}
export interface TimelineProps {
    items: TimelineItemProps[];
    mode?: TimelineMode;
    orientation?: TimelineOrientation;
    variant?: TimelineVariant;
    titleSpan?: number | string;
    reverse?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Timeline: Component<TimelineProps>;
export default Timeline;
