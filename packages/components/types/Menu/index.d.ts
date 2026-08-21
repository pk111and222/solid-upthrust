import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { MenuItem, MenuMode } from 'upthrust-competence';
export type { MenuItem } from 'upthrust-competence';
export interface MenuProps {
    items?: MenuItem[];
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
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Menu: Component<MenuProps>;
export default Menu;
