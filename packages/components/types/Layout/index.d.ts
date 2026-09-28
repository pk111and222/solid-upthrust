import { JSX } from '@solidjs/web';
import { SiderBreakpoint, SiderCollapseType } from 'upthrust-competence';
import { SiderTheme } from './styles';
import { SiderContext, SiderContextProps } from './context';
export type { SiderTheme };
export type { SiderBreakpoint, SiderCollapseType };
/** Sider 可语义化定制的节点：根节点 aside 与内容容器。 */
export type SiderSemanticName = 'root' | 'body';
type SectionAttributes<T extends HTMLElement> = Omit<JSX.HTMLAttributes<T>, 'class' | 'style' | 'children'>;
export interface LayoutProps extends SectionAttributes<HTMLDivElement> {
    /**
     * 是否横向排列（含 Sider）。不传时根据是否有 Sider 注册自动判断；
     * 服务端渲染时 Sider 尚未注册，可显式传 true 避免首屏闪动。
     */
    hasSider?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export interface HeaderProps extends SectionAttributes<HTMLElement> {
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export interface FooterProps extends SectionAttributes<HTMLElement> {
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export interface ContentProps extends SectionAttributes<HTMLElement> {
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export interface SiderProps extends Omit<SectionAttributes<HTMLElement>, 'onBreakpoint'> {
    /** 展开宽度，默认 200；数字与纯数字字符串按 px。 */
    width?: number | string;
    /** 收起宽度，默认 80；为 0 时改用挂在外侧的零宽触发器。 */
    collapsedWidth?: number | string;
    /** 当前是否收起（受控）。 */
    collapsed?: boolean;
    /** 初始是否收起（非受控）。 */
    defaultCollapsed?: boolean;
    /** 是否可收起：渲染底部触发器。 */
    collapsible?: boolean;
    /** 翻转触发器箭头方向；零宽触发器改挂在左侧。用于放在右侧的 Sider。 */
    reverseArrow?: boolean;
    /** 响应式断点：宽度低于该断点时自动收起，回到断点以上时展开。 */
    breakpoint?: SiderBreakpoint;
    /** 收起状态变化：点击触发器为 'clickTrigger'，断点触发为 'responsive'。 */
    onCollapse?: (collapsed: boolean, type: SiderCollapseType) => void;
    /** 断点命中变化；设置 breakpoint 后挂载时也会按当前宽度调用一次。 */
    onBreakpoint?: (broken: boolean) => void;
    /** 自定义触发器内容；null 时不渲染触发器（可配合受控 collapsed 自建触发器）。 */
    trigger?: JSX.Element | null;
    /** 零宽触发器的内联样式。 */
    zeroWidthTriggerStyle?: JSX.CSSProperties;
    /** 主题，默认 dark。 */
    theme?: SiderTheme;
    /** 语义化类名。 */
    classNames?: Partial<Record<SiderSemanticName, string>>;
    /** 语义化内联样式。 */
    styles?: Partial<Record<SiderSemanticName, JSX.CSSProperties>>;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export { SiderContext };
export type { SiderContextProps };
export declare const Header: (props: HeaderProps) => JSX.Element;
export declare const Footer: (props: FooterProps) => JSX.Element;
export declare const Content: (props: ContentProps) => JSX.Element;
export declare const Sider: (props: SiderProps) => JSX.Element;
declare const Layout: ((props: LayoutProps) => JSX.Element) & {
    Header: (props: HeaderProps) => JSX.Element;
    Footer: (props: FooterProps) => JSX.Element;
    Content: (props: ContentProps) => JSX.Element;
    Sider: (props: SiderProps) => JSX.Element;
};
export default Layout;
