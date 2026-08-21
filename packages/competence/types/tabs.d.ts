export type TabItem = {
    key: string;
    label: string;
    disabled?: boolean;
    closable?: boolean;
    icon?: string;
};
export type TabsConfig = {
    activeKey?: string;
    defaultActiveKey?: string;
    items: TabItem[];
    onChange?: (activeKey: string) => void;
    onTabClick?: (key: string, e: MouseEvent) => void;
};
export type TabsIns = {
    activeKey: () => string;
    setActiveKey: (key: string) => void;
    nextTab: () => void;
    prevTab: () => void;
};
export declare const createTabs: (config: TabsConfig) => {
    activeKey: import('solid-js').SourceAccessor<string>;
    setActiveKey: (key: string) => void;
    isActive: (key: string) => boolean;
    nextTab: () => void;
    prevTab: () => void;
    tabListRef: (el: HTMLElement) => void;
    refs: TabsIns;
};
export declare const tabsSplits: (keyof TabsConfig)[];
