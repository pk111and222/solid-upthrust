import { Breakpoint } from './breakpoint';
/** 收起/展开的来源：点击触发器，或断点响应（antd 同名 'responsive'）。 */
export type SiderCollapseType = 'clickTrigger' | 'responsive';
/** Sider 可用的响应断点：BREAKPOINTS 六档 + xxxl。 */
export type SiderBreakpoint = Breakpoint | 'xxxl';
/**
 * 各断点的 max-width 阈值（px）：宽度 ≤ 该值即视为“低于断点”。
 * xs…xxl 取 BREAKPOINTS − 0.02（与 antd 一致）；xxxl 与 Grid 的 xxxl（≥1920）对齐，
 * 而非 antd Sider 的 1839.98。
 */
export declare const SIDER_BREAKPOINT_MAX_WIDTHS: Record<SiderBreakpoint, number>;
/** 断点对应的媒体查询。 */
export declare const siderBreakpointQuery: (breakpoint: SiderBreakpoint) => string;
export type SiderConfig = {
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    collapsible?: boolean;
    breakpoint?: SiderBreakpoint;
    onCollapse?: (collapsed: boolean, type: SiderCollapseType) => void;
    onBreakpoint?: (broken: boolean) => void;
    /** 依赖注入：测试或非浏览器环境传入自定义 matchMedia。 */
    matchMedia?: (query: string) => MediaQueryList;
};
export type SiderIns = {
    /** 当前是否收起（受控值优先）。 */
    collapsed: () => boolean;
    /** 当前宽度是否低于 breakpoint；未设置 breakpoint 时恒为 false。 */
    broken: () => boolean;
    /** 切换收起状态，来源记为 'clickTrigger'。 */
    toggle: () => void;
};
export declare const createSider: (config?: SiderConfig) => SiderIns;
export declare const siderSplits: (keyof SiderConfig)[];
