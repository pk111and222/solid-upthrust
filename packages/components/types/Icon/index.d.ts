import { Component, JSX } from 'solid-js';

export interface IconProps {
    name: string;
    size?: 'small' | 'medium' | 'large' | number | string;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'inherit';
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Icon: Component<IconProps>;
export default Icon;
