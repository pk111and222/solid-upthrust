import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { ProgressIns } from 'upthrust-competence';
import { SizeType } from '../../common/type';
export type ProgressType = 'line' | 'circle' | 'dashboard';
export type ProgressStatus = 'success' | 'exception' | 'normal' | 'active';
export interface ProgressProps {
    type?: ProgressType;
    percent?: number;
    status?: ProgressStatus;
    /** Show percent text. Default true for line with size>=default. */
    showInfo?: boolean;
    size?: SizeType | number;
    /** Line stroke height / circle stroke width, px. */
    strokeWidth?: number;
    /** Segment steps count (line only). */
    steps?: number;
    /** Success segment: percent + optional color. */
    success?: {
        percent?: number;
    };
    strokeColor?: string;
    trailColor?: string;
    format?: (percent?: number, successPercent?: number) => JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
    ref?: (val: ProgressIns) => void;
}
declare const Progress: Component<ProgressProps>;
export default Progress;
