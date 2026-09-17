import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { CheckableTagConfig } from 'upthrust-competence';
export interface TagProps {
    children?: JSX.Element;
    /** Status color or any CSS color. Custom colors use a solid background. */
    color?: 'default' | 'success' | 'processing' | 'error' | 'warning' | (string & {});
    bordered?: boolean;
    closable?: boolean;
    closeIcon?: JSX.Element;
    closeLabel?: string;
    icon?: JSX.Element;
    disabled?: boolean;
    onClose?: (event: MouseEvent) => void;
    class?: string;
    style?: JSX.CSSProperties;
}
export interface CheckableTagProps extends CheckableTagConfig {
    children?: JSX.Element;
    icon?: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
}
export declare const CheckableTag: Component<CheckableTagProps>;
declare const Tag: Component<TagProps> & {
    CheckableTag: Component<CheckableTagProps>;
};
export default Tag;
