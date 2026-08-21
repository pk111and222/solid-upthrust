import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { DropdownMenuProps } from '../Dropdown';
export interface BreadcrumbItemType {
    title: string | JSX.Element;
    href?: string;
    /** Dropdown menu rendered on this item. */
    menu?: DropdownMenuProps;
    onClick?: (e: MouseEvent) => void;
    /** Render an ellipsis instead of the title (dropdown behavior is via menu). */
    dropdownRender?: JSX.Element;
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
