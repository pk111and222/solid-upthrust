import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { SkeletonIns } from 'upthrust-competence';
export * from './parts';
export type { SkeletonIns } from 'upthrust-competence';
export interface SkeletonProps {
    loading?: boolean;
    /** Show the wave animation. */
    active?: boolean;
    /** Round line ends. */
    round?: boolean;
    title?: boolean | {
        width?: number | string;
    };
    paragraph?: boolean | {
        rows?: number;
        width?: number | string | Array<number | string>;
    };
    avatar?: boolean | {
        size?: number | string;
        shape?: 'circle' | 'square';
    };
    /** Real content; shown when loading is false. */
    children?: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
    ref?: (val: SkeletonIns) => void;
}
declare const Skeleton: Component<SkeletonProps> & {
    Button: Component<import('./parts').SkeletonButtonProps>;
    Avatar: Component<import('./parts').SkeletonAvatarProps>;
    Input: Component<import('./parts').SkeletonInputProps>;
    Node: Component<import('./parts').SkeletonNodeProps>;
};
export default Skeleton;
