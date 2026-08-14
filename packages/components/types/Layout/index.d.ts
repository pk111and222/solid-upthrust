import { Component, JSX } from 'solid-js';

export interface LayoutProps {
    hasSider?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export interface HeaderProps {
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export interface FooterProps {
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export interface ContentProps {
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export interface SiderProps {
    width?: number | string;
    collapsedWidth?: number | string;
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    collapsible?: boolean;
    breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
    onCollapse?: (collapsed: boolean) => void;
    trigger?: JSX.Element | null;
    reverseArrow?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export declare const Header: Component<HeaderProps>;
export declare const Footer: Component<FooterProps>;
export declare const Content: Component<ContentProps>;
export declare const Sider: Component<SiderProps>;
declare const Layout: Component<LayoutProps> & {
    Header: Component<HeaderProps>;
    Footer: Component<FooterProps>;
    Content: Component<ContentProps>;
    Sider: Component<SiderProps>;
};
export default Layout;
