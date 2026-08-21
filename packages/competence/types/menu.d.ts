export type MenuMode = 'vertical' | 'horizontal' | 'inline';
export type MenuItem = {
    key: string;
    label: string;
    icon?: string;
    disabled?: boolean;
    danger?: boolean;
    children?: MenuItem[];
    type?: 'group' | 'divider';
};
export type MenuConfig = {
    items: MenuItem[];
    mode?: MenuMode;
    selectedKeys?: string[];
    defaultSelectedKeys?: string[];
    openKeys?: string[];
    defaultOpenKeys?: string[];
    multiple?: boolean;
    onSelect?: (info: {
        key: string;
        selectedKeys: string[];
    }) => void;
    onOpenChange?: (openKeys: string[]) => void;
};
export type MenuIns = {
    selectedKeys: () => string[];
    openKeys: () => string[];
    select: (key: string) => void;
    toggleOpen: (key: string) => void;
};
export declare const createMenu: (config: MenuConfig) => {
    selectedKeys: import('solid-js').SourceAccessor<string[]>;
    openKeys: import('solid-js').SourceAccessor<string[]>;
    select: (key: string) => void;
    toggleOpen: (key: string) => void;
    openSub: (key: string) => void;
    closeSub: (key: string) => void;
    isSelected: (key: string) => boolean;
    isOpen: (key: string) => boolean;
    refs: MenuIns;
};
export declare const menuSplits: (keyof MenuConfig)[];
