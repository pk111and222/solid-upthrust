import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { TabItem, TabsIns } from 'upthrust-competence';
export type { TabsIns } from 'upthrust-competence';
export type TabsItem = TabItem & {
    children?: JSX.Element;
};
export interface TabsProps {
    activeKey?: string;
    defaultActiveKey?: string;
    items: TabsItem[];
    type?: 'line' | 'card' | 'editable-card';
    editable?: boolean;
    hideAdd?: boolean;
    addIcon?: JSX.Element;
    draggable?: boolean;
    onEdit?: (target: string | MouseEvent, action: 'add' | 'remove') => void;
    onReorder?: (items: TabsItem[], info: {
        key: string;
        from: number;
        to: number;
    }) => void;
    size?: 'small' | 'middle' | 'large';
    tabPosition?: 'top' | 'bottom' | 'left' | 'right';
    centered?: boolean;
    onChange?: (activeKey: string) => void;
    onTabClick?: (key: string, e: MouseEvent) => void;
    destroyInactiveTabPane?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    ref?: (val: TabsIns) => void;
}
declare const Tabs: Component<TabsProps>;
export default Tabs;
