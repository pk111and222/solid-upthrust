import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
export type AvatarSize = 'large' | 'middle' | 'small' | number | {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
};
export interface AvatarProps {
    /** Image source; falls back to icon, then children initials on error/absence */
    src?: string;
    srcSet?: string;
    alt?: string;
    icon?: JSX.Element;
    size?: AvatarSize;
    shape?: 'circle' | 'square';
    /** Background color (any CSS color). Text stays white unless `textColor`. */
    color?: string;
    /** Text color when customizing (defaults to on-primary white) */
    textColor?: string;
    /** Max character count of the initials fallback (scales from the tail) */
    maxCount?: number;
    onError?: (e: Event) => boolean | void;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
declare const Avatar: Component<AvatarProps>;
export interface AvatarGroupProps {
    maxCount?: number;
    maxStyle?: JSX.CSSProperties;
    maxPopoverTrigger?: 'hover' | 'click' | 'focus';
    size?: AvatarSize;
    shape?: 'circle' | 'square';
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
declare const AvatarGroup: Component<AvatarGroupProps>;
export default Avatar;
export { AvatarGroup };
