import { Breakpoint } from './breakpoint';
export type SiderCollapseType = 'clickTrigger' | 'breakpoint';
export type SiderConfig = {
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    collapsible?: boolean;
    breakpoint?: Breakpoint;
    onCollapse?: (collapsed: boolean, type: SiderCollapseType) => void;
    onBreakpoint?: (broken: boolean) => void;
    /** Dependency injection for tests / non-browser environments. */
    matchMedia?: (query: string) => MediaQueryList;
};
export type SiderIns = {
    collapsed: () => boolean;
    broken: () => boolean;
    toggle: () => void;
};
export declare const createSider: (config?: SiderConfig) => SiderIns;
export declare const siderSplits: (keyof SiderConfig)[];
