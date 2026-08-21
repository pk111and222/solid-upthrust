import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { SizeType } from '../../common/type';
import { ButtonIns, ButtonVariant, ButtonColor } from 'upthrust-competence';
type ButtonType = 'primary' | 'link' | 'text' | 'default' | 'dashed';
type ButtonShape = 'default' | 'circle' | 'round';
export interface ButtonProps {
    variant?: ButtonVariant;
    color?: ButtonColor;
    type?: ButtonType;
    block?: boolean;
    danger?: boolean;
    disabled?: boolean;
    ghost?: boolean;
    href?: string;
    icon?: JSX.Element;
    iconPlacement?: 'start' | 'end';
    loading?: boolean | {
        delay: number;
    };
    shape?: ButtonShape;
    size?: SizeType;
    target?: HTMLAnchorElement['target'];
    rel?: HTMLAnchorElement['rel'];
    onClick?: (event: MouseEvent) => void;
    children?: JSX.Element;
    ref?: (val: ButtonIns) => void;
}
declare const Button: Component<ButtonProps>;
export default Button;
