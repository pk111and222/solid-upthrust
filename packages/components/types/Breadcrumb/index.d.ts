import { Component, JSX } from 'solid-js';

export interface BreadcrumbItemType {
    title: string | JSX.Element;
    href?: string;
    onClick?: (e: MouseEvent) => void;
}
export interface BreadcrumbProps {
    separator?: JSX.Element;
    items?: BreadcrumbItemType[];
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export interface BreadcrumbItemProps {
    href?: string;
    onClick?: (e: MouseEvent) => void;
    class?: string;
    children?: JSX.Element;
}
declare const BreadcrumbItem: Component<BreadcrumbItemProps>;
declare const Breadcrumb: Component<BreadcrumbProps> & {
    Item: typeof BreadcrumbItem;
};
export { BreadcrumbItem };
export default Breadcrumb;
