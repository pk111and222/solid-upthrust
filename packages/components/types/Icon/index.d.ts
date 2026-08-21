import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
export interface IconProps {
    /** Iconify identifier: "collection:name" (e.g. "mdi:home", "material-symbols:15mp-outline"). Without colon defaults to mdi. */
    name: string;
    size?: 'small' | 'middle' | 'large' | number | string;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'inherit';
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: JSX.CSSProperties;
    onClick?: (e: MouseEvent) => void;
}
declare function toIconClass(name: string): string;
declare const Icon: Component<IconProps>;
export default Icon;
export { toIconClass };
