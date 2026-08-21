import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { MasonryColumns } from 'upthrust-competence';
import { SizeType } from '../../common/type';
type MasonryGutter = SizeType | number | [number, number];
export interface MasonryProps {
    /** Fixed column count, or named breakpoints mapping to a column count. */
    columns?: MasonryColumns;
    gutter?: MasonryGutter;
    sequential?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
declare const Masonry: Component<MasonryProps>;
export default Masonry;
