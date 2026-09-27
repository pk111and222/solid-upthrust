import { Component } from 'solid-js';
import { AvatarSize } from 'upthrust-competence';
import { JSX } from '@solidjs/web';
export type { AvatarSize } from 'upthrust-competence';
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
