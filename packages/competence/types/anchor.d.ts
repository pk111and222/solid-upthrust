export type AnchorItem = {
    key: string;
    href: string;
    title: string;
    children?: AnchorItem[];
};
export type AnchorConfig = {
    items: AnchorItem[];
    targetOffset?: number;
    onChange?: (activeKey: string) => void;
    getCurrentAnchor?: () => string;
    bounds?: number;
};
export type AnchorIns = {
    activeKey: () => string;
    scrollTo: (key: string) => void;
};
export declare const createAnchor: (config: AnchorConfig) => {
    activeKey: import('solid-js').Accessor<string>;
    scrollTo: (key: string) => void;
    containerRef: (el: HTMLElement) => void;
    refs: AnchorIns;
};
export declare const anchorSplits: (keyof AnchorConfig)[];
