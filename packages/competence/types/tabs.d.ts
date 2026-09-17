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
    editable?: boolean;
    draggable?: boolean;
    onEdit?: (target: string | MouseEvent, action: 'add' | 'remove') => void;
    onReorder?: (keys: string[], info: {
        key: string;
        from: number;
        to: number;
    }) => void;
};
export type TabsIns = {
    activeKey: () => string;
    setActiveKey: (key: string) => void;
    nextTab: () => void;
    prevTab: () => void;
};
export declare const createTabs: (config: TabsConfig) => {
    items: import('solid-js').SourceAccessor<TabItem[]>;
    add: (event?: MouseEvent) => void;
    remove: (key: string) => void;
    reorder: (key: string, target: string) => void;
    startDrag: (key: string) => boolean;
    endDrag: () => void;
    drop: (target: string) => void;
    draggingKey: import('solid-js').SourceAccessor<string | undefined>;
    activeKey: import('solid-js').SourceAccessor<string>;
    setActiveKey: (key: string) => void;
    isActive: (key: string) => boolean;
    nextTab: () => void;
    prevTab: () => void;
    tabListRef: (el: HTMLElement) => void;
    refs: TabsIns;
};
export declare const tabsSplits: (keyof TabsConfig)[];
