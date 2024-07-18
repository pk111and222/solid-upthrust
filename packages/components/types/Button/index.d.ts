import { Component, JSX } from 'solid-js';
import { SizeType } from '../../common/type';

type ButtonType = 'primary' | 'link' | 'text' | 'secondary' | 'danger' | 'dashed';
type ButtonSemantic = 'button' | 'icon' | 'text';
export interface ButtonProps {
    classGroup?: Record<ButtonSemantic, Record<string, boolean>>;
    type?: ButtonType;
    block?: boolean;
    danger?: boolean;
    disabled?: boolean;
    ghost?: boolean;
    href?: string;
    icon?: Component;
    loading?: boolean;
    shape?: 'default' | 'circle' | 'round';
    size?: SizeType;
    target?: string;
    onClick?: (event: MouseEvent) => void;
    children: JSX.Element;
}
declare const Button: Component<ButtonProps>;
export default Button;
