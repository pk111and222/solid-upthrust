import { Component, JSX } from 'solid-js';
import { AnchorItem } from 'upthrust-competence';

export interface AnchorProps {
    items: AnchorItem[];
    direction?: 'vertical' | 'horizontal';
    targetOffset?: number;
    onChange?: (activeKey: string) => void;
    getCurrentAnchor?: () => string;
    bounds?: number;
    class?: string;
    style?: JSX.CSSProperties;
}
export interface AnchorLinkProps {
    item: AnchorItem;
    direction: 'vertical' | 'horizontal';
    activeKey: () => string;
    onLinkClick: (key: string) => void;
    level?: number;
}
declare const Anchor: Component<AnchorProps>;
export default Anchor;
