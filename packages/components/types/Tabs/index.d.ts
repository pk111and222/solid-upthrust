import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { TabItem } from 'upthrust-competence';
export type TabsItem = TabItem & {
    children?: JSX.Element;
};
export interface TabsProps {
    activeKey?: string;
    defaultActiveKey?: string;
    items: TabsItem[];
    type?: 'line' | 'card';
    size?: 'small' | 'middle' | 'large';
    tabPosition?: 'top' | 'bottom' | 'left' | 'right';
    centered?: boolean;
    onChange?: (activeKey: string) => void;
    onTabClick?: (key: string, e: MouseEvent) => void;
    destroyInactiveTabPane?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Tabs: Component<TabsProps>;
export default Tabs;
