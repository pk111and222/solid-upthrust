import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { AnchorItem } from 'upthrust-competence';
export interface AnchorProps {
    items: AnchorItem[];
    direction?: 'vertical' | 'horizontal';
    targetOffset?: number;
    onChange?: (activeKey: string) => void;
    getCurrentAnchor?: () => string;
    bounds?: number;
    /** Scroll container for scroll-spy; defaults to window. */
    getScrollContainer?: () => HTMLElement | Window | undefined;
    class?: string;
    style?: JSX.CSSProperties;
}
export interface AnchorLinkProps {
    item: AnchorItem;
    direction: 'vertical' | 'horizontal';
    activeKey: () => string;
    onLinkClick: (key: string, e: MouseEvent) => void;
    level?: number;
    registerRef?: (key: string, el: HTMLAnchorElement) => void;
    unregisterRef?: (key: string) => void;
}
declare const Anchor: Component<AnchorProps>;
export default Anchor;
