import { Component, JSX } from 'solid-js';
import { SizeType } from '../../common/type';
import { ButtonIns } from 'upthrust-competence';

type ButtonType = 'primary' | 'link' | 'text' | 'default' | 'danger' | 'dashed';
type ButtonSemantic = 'button' | 'loading' | 'text' | 'anchor';
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
    target?: HTMLAnchorElement['target'];
    rel?: HTMLAnchorElement['rel'];
    onClick?: (event: MouseEvent) => void;
    children?: JSX.Element;
    ref?: (val: ButtonIns) => void;
}
declare const Button: Component<ButtonProps>;
export default Button;
