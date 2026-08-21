import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { StepItem, StepStatus } from 'upthrust-competence';
export type { StepItem, StepStatus } from 'upthrust-competence';
export interface StepsProps {
    current?: number;
    status?: StepStatus;
    items: StepItem[];
    direction?: 'horizontal' | 'vertical';
    size?: 'default' | 'small';
    /** Dot-style progress indicator instead of numbered circles. */
    progressDot?: boolean;
    /** 0-100 progress of the current step; drives the dot's fill hint. */
    percent?: number;
    onChange?: (current: number) => void;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Steps: Component<StepsProps>;
export default Steps;
