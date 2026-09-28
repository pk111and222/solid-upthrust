import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { DropdownProps } from '../Dropdown';
import { SemanticInput } from '../../common/semantic';
/**
 * Breadcrumb 面包屑（对齐 antd 6）。
 *
 * 结构：nav > ol > li（项）+ li[aria-hidden]（分隔符）；最后一项后不渲染分隔符。
 * 有 href（或由 path 累积出 href）的项渲染为 a，其余为 span；两者都接收 onClick。
 * path 规则与 antd 一致：带 path 的项依次累积 paths，href 被覆盖为 `#/${paths.join('/')}`；
 * path 与字符串 title 中的 `:name` 用 params 替换。
 */
/** 下拉菜单项：title 是 label 的别名；path 时渲染为 `<a href={item.href + path}>`。 */
export interface BreadcrumbMenuItem {
    key?: string;
    label?: JSX.Element;
    title?: JSX.Element;
    path?: string;
    icon?: string;
    disabled?: boolean;
    danger?: boolean;
    type?: 'divider';
    onClick?: () => void;
}
export interface BreadcrumbMenuProps {
    items: BreadcrumbMenuItem[];
    onClick?: (key: string) => void;
}
/** 透传给 Dropdown 的属性（placement 默认 'bottom'，trigger 默认 'hover'）。 */
export type BreadcrumbDropdownProps = Partial<Pick<DropdownProps, 'trigger' | 'placement' | 'open' | 'defaultOpen' | 'onOpenChange' | 'disabled' | 'overlayClass' | 'overlayStyle'>>;
export interface BreadcrumbItemType {
    key?: string;
    /** 项内容；字符串中的 `:name` 用 params 替换。为 null / undefined 时整项（含其后分隔符）不渲染。 */
    title?: JSX.Element;
    /** 链接地址；存在时渲染为 a。 */
    href?: string;
    /** 路由片段：与前面各项的 path 拼接为 `#/a/b`，覆盖 href。 */
    path?: string;
    /** 下拉菜单。 */
    menu?: BreadcrumbMenuProps;
    /** 下拉菜单的 Dropdown 属性。 */
    dropdownProps?: BreadcrumbDropdownProps;
    onClick?: (e: MouseEvent) => void;
    /** 作用于该项的 a / span（与 antd className 一致；itemRender 时由调用方自行处理）。 */
    class?: string;
    style?: JSX.CSSProperties;
    /** `'separator'`：独立分隔符项，内容为 separator。 */
    type?: 'separator';
    /** type 为 'separator' 时的分隔符内容，默认 '/'。 */
    separator?: JSX.Element;
    /** @deprecated 渲染该节点替代 title（旧版本兼容）；请改用 menu。 */
    dropdownRender?: JSX.Element;
}
export type BreadcrumbParams = Record<string, string>;
export type BreadcrumbItemRender = (route: BreadcrumbItemType, params: BreadcrumbParams, routes: BreadcrumbItemType[], paths: string[]) => JSX.Element;
export interface BreadcrumbClassNames {
    root?: string;
    item?: string;
    separator?: string;
}
export interface BreadcrumbStyles {
    root?: JSX.CSSProperties;
    item?: JSX.CSSProperties;
    separator?: JSX.CSSProperties;
}
export interface BreadcrumbSemanticInfo {
    props: BreadcrumbProps;
}
export interface BreadcrumbProps {
    /** 路由栈。传入时忽略 children。 */
    items?: BreadcrumbItemType[];
    /** 分隔符，默认 '/'。 */
    separator?: JSX.Element;
    /** 路由参数。 */
    params?: BreadcrumbParams;
    /** 自定义每项内容（替代默认的 a / span）。 */
    itemRender?: BreadcrumbItemRender;
    classNames?: SemanticInput<BreadcrumbClassNames, BreadcrumbSemanticInfo>;
    styles?: SemanticInput<BreadcrumbStyles, BreadcrumbSemanticInfo>;
    class?: string;
    style?: JSX.CSSProperties;
    /** 旧写法：`<Breadcrumb.Item>` 子元素。 */
    children?: JSX.Element;
}
export interface BreadcrumbItemProps {
    href?: string;
    onClick?: (e: MouseEvent) => void;
    menu?: BreadcrumbMenuProps;
    dropdownProps?: BreadcrumbDropdownProps;
    /** 覆盖该项后的分隔符。 */
    separator?: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
declare const BreadcrumbItem: Component<BreadcrumbItemProps>;
declare const Breadcrumb: Component<BreadcrumbProps> & {
    Item: typeof BreadcrumbItem;
};
export { BreadcrumbItem };
export default Breadcrumb;
