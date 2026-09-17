import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
export interface SkeletonElementProps {
    active?: boolean;
    size?: 'small' | 'middle' | 'large' | number;
    class?: string;
    style?: JSX.CSSProperties;
}
export interface SkeletonButtonProps extends SkeletonElementProps {
    block?: boolean;
    shape?: 'default' | 'round' | 'circle';
}
export interface SkeletonAvatarProps extends SkeletonElementProps {
    shape?: 'circle' | 'square';
}
export interface SkeletonInputProps extends SkeletonElementProps {
    block?: boolean;
}
export interface SkeletonNodeProps extends SkeletonElementProps {
    children?: JSX.Element;
}
export declare const SkeletonButton: Component<SkeletonButtonProps>;
export declare const SkeletonAvatar: Component<SkeletonAvatarProps>;
export declare const SkeletonInput: Component<SkeletonInputProps>;
export declare const SkeletonNode: Component<SkeletonNodeProps>;
